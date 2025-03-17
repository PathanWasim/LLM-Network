use tokio::net::{TcpStream, TcpListener};
use tokio::io::{AsyncWriteExt, AsyncReadExt};
use tokio::sync::Mutex;
use tokio::time::sleep;
use std::sync::Arc;
use std::time::Duration;
use std::path::{Path, PathBuf};
use std::collections::{HashSet, HashMap};
use tokio::fs;
use crate::conversation::{ChatMessage, Conversation, CONVERSATION_STORE};
use crate::persistence::CONVERSATIONS_DIR;
use lazy_static::lazy_static;
use reqwest::Client;

const RECEIVED_DIR: &str = "received";
const PORT: i32 = 7878;
const SYNC_INTERVAL: Duration = Duration::from_secs(30);
const OLLAMA_PORT: i32 = 11434;
const OLLAMA_CHECK_URL: &str = "http://127.0.0.1:11434/api/tags";

#[derive(Debug)]
enum Message {
    ConversationFile {
        name: String,
        content: String,
    },
    SyncRequest,
    SyncResponse(Vec<Conversation>),
    LLMCapability {
        has_llm: bool,
    },
    LLMAccessRequest {
        peer_name: String,
        reason: String,
    },
    LLMAccessResponse {
        granted: bool,
        message: String,
        llm_host: Option<String>,
        llm_port: Option<i32>,
    },
}

// Store LLM-capable peers, authorized peers, and LLM connection details
lazy_static! {
    static ref LLM_PEERS: Arc<Mutex<HashSet<String>>> = Arc::new(Mutex::new(HashSet::new()));
    static ref AUTHORIZED_PEERS: Arc<Mutex<HashSet<String>>> = Arc::new(Mutex::new(HashSet::new()));
    static ref LLM_CONNECTIONS: Arc<Mutex<HashMap<String, (String, i32)>>> = Arc::new(Mutex::new(HashMap::new()));
}

impl Message {
    async fn send(&self, stream: &mut TcpStream) -> std::io::Result<()> {
        match self {
            Message::ConversationFile { name, content } => {
                stream.write_all(b"FILE:").await?;
                let data = format!("{}|{}", name, content);
                let len = data.len() as u64;
                stream.write_all(&len.to_le_bytes()).await?;
                stream.write_all(data.as_bytes()).await?;
            }
            Message::SyncRequest => {
                stream.write_all(b"SYNC:").await?;
                let len = 0u64;
                stream.write_all(&len.to_le_bytes()).await?;
            }
            Message::SyncResponse(conversations) => {
                stream.write_all(b"RESP:").await?;
                let data = serde_json::to_string(conversations)?;
                let len = data.len() as u64;
                stream.write_all(&len.to_le_bytes()).await?;
                stream.write_all(data.as_bytes()).await?;
            }
            Message::LLMCapability { has_llm } => {
                stream.write_all(b"LLMC:").await?;
                let data = has_llm.to_string();
                let len = data.len() as u64;
                stream.write_all(&len.to_le_bytes()).await?;
                stream.write_all(data.as_bytes()).await?;
            }
            Message::LLMAccessRequest { peer_name, reason } => {
                stream.write_all(b"LREQ:").await?;
                let data = format!("{}|{}", peer_name, reason);
                let len = data.len() as u64;
                stream.write_all(&len.to_le_bytes()).await?;
                stream.write_all(data.as_bytes()).await?;
            }
            Message::LLMAccessResponse { granted, message, llm_host, llm_port } => {
                stream.write_all(b"LRES:").await?;
                let host_str = llm_host.as_deref().unwrap_or("");
                let port_str = llm_port.map(|p| p.to_string()).unwrap_or_default();
                let data = format!("{}|{}|{}|{}", granted, message, host_str, port_str);
                let len = data.len() as u64;
                stream.write_all(&len.to_le_bytes()).await?;
                stream.write_all(data.as_bytes()).await?;
            }
        }
        stream.flush().await?;
        Ok(())
    }

    async fn receive(stream: &mut TcpStream) -> std::io::Result<Option<Message>> {
        let mut marker = [0u8; 5];
        if let Ok(0) = stream.read_exact(&mut marker).await {
            return Ok(None);
        }

        let mut len_bytes = [0u8; 8];
        stream.read_exact(&mut len_bytes).await?;
        let len = u64::from_le_bytes(len_bytes) as usize;

        let mut data = vec![0u8; len];
        stream.read_exact(&mut data).await?;

        match &marker {
            b"FILE:" => {
                let content = String::from_utf8_lossy(&data);
                if let Some((name, content)) = content.split_once('|') {
                    Ok(Some(Message::ConversationFile {
                        name: name.to_string(),
                        content: content.to_string(),
                    }))
                } else {
                    Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "Invalid file format"))
                }
            }
            b"SYNC:" => Ok(Some(Message::SyncRequest)),
            b"RESP:" => {
                let conversations = serde_json::from_slice(&data)?;
                Ok(Some(Message::SyncResponse(conversations)))
            }
            b"LLMC:" => {
                let has_llm = String::from_utf8_lossy(&data).parse::<bool>().unwrap_or(false);
                Ok(Some(Message::LLMCapability { has_llm }))
            }
            b"LREQ:" => {
                let content = String::from_utf8_lossy(&data);
                if let Some((peer_name, reason)) = content.split_once('|') {
                    Ok(Some(Message::LLMAccessRequest {
                        peer_name: peer_name.to_string(),
                        reason: reason.to_string(),
                    }))
                } else {
                    Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "Invalid LLM request format"))
                }
            }
            b"LRES:" => {
                let content = String::from_utf8_lossy(&data);
                let parts: Vec<&str> = content.split('|').collect();
                if parts.len() == 4 {
                    let granted = parts[0].parse().unwrap_or(false);
                    let message = parts[1].to_string();
                    let llm_host = if !parts[2].is_empty() { Some(parts[2].to_string()) } else { None };
                    let llm_port = if !parts[3].is_empty() { parts[3].parse().ok() } else { None };
                    Ok(Some(Message::LLMAccessResponse {
                        granted,
                        message,
                        llm_host,
                        llm_port,
                    }))
                } else {
                    Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "Invalid LLM response format"))
                }
            }
            _ => Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "Unknown message type")),
        }
    }
}

// Check if Ollama is running
async fn is_ollama_available() -> bool {
    if let Ok(client) = Client::builder()
        .timeout(Duration::from_secs(2))
        .build() 
    {
        match client.get(OLLAMA_CHECK_URL).send().await {
            Ok(response) => response.status().is_success(),
            Err(_) => false,
        }
    } else {
        false
    }
}

pub async fn listen_for_connections() -> std::io::Result<()> {
    // Create received directory if it doesn't exist
    let received_path = Path::new(RECEIVED_DIR);
    if !received_path.exists() {
        fs::create_dir_all(received_path).await?;
    }

    let listener = TcpListener::bind(format!("0.0.0.0:{}", PORT)).await?;
    println!("TCP: Listening on port {}", PORT);

    loop {
        let (stream, addr) = listener.accept().await?;
        println!("TCP: New connection from {}", addr);
        tokio::spawn(async move {
            if let Err(e) = handle_connection(stream).await {
                eprintln!("TCP: Connection error with {}: {}", addr, e);
            }
        });
    }
}

async fn handle_connection(mut stream: TcpStream) -> std::io::Result<()> {
    let addr = stream.peer_addr()?;
    println!("TCP: Connected to {}", addr);

    // Check Ollama availability before sending capability
    let has_llm = is_ollama_available().await;
    
    // Send our LLM capability immediately
    if let Err(e) = (Message::LLMCapability { has_llm }).send(&mut stream).await {
        return Err(e);
    }

    if has_llm {
        println!("TCP: Announced LLM capability to {}", addr);
    } else {
        println!("TCP: Announced no LLM capability to {} (Ollama not available)", addr);
    }

    loop {
        if let Some(message) = Message::receive(&mut stream).await? {
            match message {
                Message::ConversationFile { name, content } => {
                    let file_path = Path::new(RECEIVED_DIR).join(&name);
                    fs::write(&file_path, content).await?;
                    println!("TCP: Received conversation file {} from {}", name, addr);
                }
                Message::SyncRequest => {
                    println!("TCP: Sync request from {}", addr);
                    let conversations = CONVERSATION_STORE.get_all_conversations().await;
                    Message::SyncResponse(conversations).send(&mut stream).await?;
                }
                Message::SyncResponse(conversations) => {
                    println!("TCP: Received {} conversations from {}", conversations.len(), addr);
                    for conversation in conversations {
                        let json = serde_json::to_string_pretty(&conversation)?;
                        let file_name = format!("{}.json", conversation.id);
                        let file_path = Path::new(RECEIVED_DIR).join(&file_name);
                        fs::write(&file_path, json).await?;
                        println!("TCP: Saved conversation file {} from {}", file_name, addr);
                    }
                }
                Message::LLMCapability { has_llm } => {
                    if has_llm {
                        let mut llm_peers = LLM_PEERS.lock().await;
                        llm_peers.insert(addr.ip().to_string());
                        println!("TCP: Peer {} has LLM capability", addr);
                    } else {
                        let mut llm_peers = LLM_PEERS.lock().await;
                        llm_peers.remove(&addr.ip().to_string());
                        println!("TCP: Peer {} does not have LLM capability", addr);
                    }
                }
                Message::LLMAccessRequest { peer_name, reason } => {
                    if has_llm {
                        println!("TCP: Received LLM access request from {} ({}): {}", addr, peer_name, reason);
                        
                        // Include our IP and Ollama port in the response
                        let response = Message::LLMAccessResponse {
                            granted: true,
                            message: "Access granted automatically".to_string(),
                            llm_host: Some(addr.ip().to_string()),
                            llm_port: Some(OLLAMA_PORT),
                        };
                        
                        if let Err(e) = response.send(&mut stream).await {
                            eprintln!("TCP: Failed to send LLM access response to {}: {}", addr, e);
                        } else {
                            let mut authorized = AUTHORIZED_PEERS.lock().await;
                            authorized.insert(addr.ip().to_string());
                            println!("TCP: Granted LLM access to {} ({}) with port {}", addr, peer_name, OLLAMA_PORT);
                        }
                    } else {
                        let response = Message::LLMAccessResponse {
                            granted: false,
                            message: "This peer does not have LLM capability".to_string(),
                            llm_host: None,
                            llm_port: None,
                        };
                        if let Err(e) = response.send(&mut stream).await {
                            eprintln!("TCP: Failed to send LLM access response to {}: {}", addr, e);
                        }
                    }
                }
                Message::LLMAccessResponse { granted, message, llm_host, llm_port } => {
                    if granted {
                        let mut authorized = AUTHORIZED_PEERS.lock().await;
                        authorized.insert(addr.ip().to_string());
                        
                        // Store LLM connection details if provided
                        if let (Some(host), Some(port)) = (llm_host, llm_port) {
                            let mut connections = LLM_CONNECTIONS.lock().await;
                            connections.insert(addr.ip().to_string(), (host, port));
                            println!("TCP: LLM access granted by {} - {} (LLM available at {}:{})", 
                                   addr, message, host, port);
                        } else {
                            println!("TCP: LLM access granted by {} - {}", addr, message);
                        }
                    } else {
                        println!("TCP: LLM access denied by {} - {}", addr, message);
                    }
                }
            }
        }
    }
}

pub async fn connect_to_peers(received_ips: Arc<Mutex<HashSet<String>>>) {
    loop {
        let mut ips = received_ips.lock().await;
        for ip in ips.drain() {
            let addr = format!("{}:{}", ip, PORT);
            match TcpStream::connect(&addr).await {
                Ok(mut stream) => {
                    println!("TCP: Connected to {}", addr);
                    
                    // Check Ollama availability before sending capability
                    let has_llm = is_ollama_available().await;
                    
                    // Send our LLM capability
                    if let Err(e) = (Message::LLMCapability { has_llm }).send(&mut stream).await {
                        eprintln!("TCP: Failed to send LLM capability to {}: {}", addr, e);
                        continue;
                    }

                    if has_llm {
                        println!("TCP: Announced LLM capability to {}", addr);
                    } else {
                        println!("TCP: Announced no LLM capability to {} (Ollama not available)", addr);
                    }

                    // If peer has LLM and we're not authorized, request access
                    let llm_peers = LLM_PEERS.lock().await;
                    let authorized = AUTHORIZED_PEERS.lock().await;
                    if llm_peers.contains(&ip) && !authorized.contains(&ip) {
                        drop(llm_peers);
                        drop(authorized);
                        if let Err(e) = request_llm_access(&mut stream, &addr).await {
                            eprintln!("TCP: Failed to request LLM access from {}: {}", addr, e);
                        }
                    }

                    // Send local conversations
                    if let Ok(entries) = fs::read_dir(CONVERSATIONS_DIR).await {
                        let mut entries = entries;
                        while let Ok(Some(entry)) = entries.next_entry().await {
                            if let Ok(content) = fs::read_to_string(entry.path()).await {
                                if let Some(file_name) = entry.file_name().to_str() {
                                    let message = Message::ConversationFile {
                                        name: file_name.to_string(),
                                        content,
                                    };
                                    if let Err(e) = message.send(&mut stream).await {
                                        eprintln!("TCP: Failed to send file to {}: {}", addr, e);
                                    } else {
                                        println!("TCP: Successfully sent {} to {}", file_name, addr);
                                    }
                                }
                            }
                        }
                    }
                }
                Err(e) => eprintln!("TCP: Failed to connect to {}: {}", addr, e),
            }
        }
        drop(ips);
        sleep(SYNC_INTERVAL).await;
    }
}

async fn request_llm_access(stream: &mut TcpStream, addr: &str) -> std::io::Result<bool> {
    let hostname = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "Unknown".to_string());

    let request = Message::LLMAccessRequest {
        peer_name: hostname,
        reason: "Requesting access to LLM services".to_string(),
    };

    request.send(stream).await?;
    println!("TCP: Sent LLM access request to {}", addr);

    // Wait for response
    if let Some(Message::LLMAccessResponse { granted, message }) = Message::receive(stream).await? {
        if granted {
            println!("TCP: LLM access granted by {} - {}", addr, message);
            let mut authorized = AUTHORIZED_PEERS.lock().await;
            authorized.insert(addr.to_string());
        } else {
            println!("TCP: LLM access denied by {} - {}", addr, message);
        }
        Ok(granted)
    } else {
        println!("TCP: No response received for LLM access request from {}", addr);
        Ok(false)
    }
} 