use tokio::net::{TcpStream, TcpListener};
use tokio::io::{AsyncWriteExt, AsyncReadExt};
use tokio::sync::Mutex;
use tokio::time::sleep;
use std::sync::Arc;
use std::time::Duration;
use std::path::{Path, PathBuf};
use std::collections::HashSet;
use std::fs;
use crate::conversation::{ChatMessage, Conversation, CONVERSATION_STORE};

const RECEIVED_DIR: &str = "received";

const PORT: i32 = 7878;

#[derive(Debug)]
enum Message {
    FileInfo {
        path: PathBuf,
        size: u64,
    },
    FileData(Vec<u8>),
    Chat(ChatMessage),
    SyncRequest,
    SyncResponse(Vec<Conversation>),
}

impl Message {
    async fn send(&self, stream: &mut TcpStream) -> std::io::Result<()> {
        match self {
            Message::FileInfo { path, size } => {
                stream.write_all(b"INFO:").await?;
                let data = format!("{}{}", path.to_string_lossy(), size);
                let len = data.len() as u64;
                stream.write_all(&len.to_le_bytes()).await?;
                stream.write_all(data.as_bytes()).await?;
            }
            Message::FileData(data) => {
                stream.write_all(b"DATA:").await?;
                let len = data.len() as u64;
                stream.write_all(&len.to_le_bytes()).await?;
                stream.write_all(data).await?;
            }
            Message::Chat(chat_message) => {
                stream.write_all(b"CHAT:").await?;
                let data = serde_json::to_string(chat_message)?;
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
            b"INFO:" => {
                let content = String::from_utf8_lossy(&data);
                let path_str = &content[..content.len()-20];
                let size_str = &content[content.len()-20..];
                Ok(Some(Message::FileInfo {
                    path: PathBuf::from(path_str),
                    size: size_str.trim().parse().unwrap_or(0),
                }))
            }
            b"DATA:" => Ok(Some(Message::FileData(data))),
            b"CHAT:" => {
                let chat_message = serde_json::from_slice(&data)?;
                Ok(Some(Message::Chat(chat_message)))
            }
            b"SYNC:" => Ok(Some(Message::SyncRequest)),
            b"RESP:" => {
                let conversations = serde_json::from_slice(&data)?;
                Ok(Some(Message::SyncResponse(conversations)))
            }
            _ => Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "Unknown message type")),
        }
    }
}

pub async fn listen_for_connections() -> std::io::Result<()> {
    // Create received directory if it doesn't exist
    let received_path = Path::new(RECEIVED_DIR);
    if !received_path.exists() {
        fs::create_dir_all(received_path)?;
    }

    let listener = TcpListener::bind(format!("0.0.0.0:{}", PORT)).await?;
    println!("🎯 TCP: Listening for incoming connections on port {}", PORT);

    loop {
        let (stream, addr) = listener.accept().await?;
        println!("🔗 TCP: New incoming connection from {}", addr);
        tokio::spawn(async move {
            if let Err(e) = handle_connection(stream).await {
                eprintln!("❌ TCP: Connection error with {}: {}", addr, e);
            }
        });
    }
}

async fn handle_connection(mut stream: TcpStream) -> std::io::Result<()> {
    let addr = stream.peer_addr()?;
    println!("🤝 TCP: Handling connection from {}", addr);

    loop {
        if let Some(message) = Message::receive(&mut stream).await? {
            match message {
                Message::Chat(chat_message) => {
                    println!("💬 TCP: Received chat message from {}: {}", addr, chat_message.content);
                    CONVERSATION_STORE.add_message("network".to_string(), chat_message).await;
                    
                    // Send the updated conversation file
                    if let Some(conversation) = CONVERSATION_STORE.get_conversation("network").await {
                        let file_path = std::path::Path::new(crate::persistence::CONVERSATIONS_DIR)
                            .join(format!("{}.json", conversation.id));
                        if let Ok(metadata) = std::fs::metadata(&file_path) {
                            Message::FileInfo {
                                path: file_path.clone(),
                                size: metadata.len(),
                            }.send(&mut stream).await?;
                            
                            let content = std::fs::read(&file_path)?;
                            Message::FileData(content).send(&mut stream).await?;
                            println!("Sent conversation file to {}", addr);
                            println!("chat history sent successfully");
                        }
                    }
                }
                Message::SyncRequest => {
                    println!("🔄 TCP: Received sync request from {}", addr);
                    let conversations = CONVERSATION_STORE.get_all_conversations().await;
                    Message::SyncResponse(conversations).send(&mut stream).await?;
                }
                Message::FileInfo { path, size } => {
                    println!("📁 TCP: Receiving file {} ({} bytes) from {}", path.display(), size, addr);
                }
                Message::FileData(data) => {
                    println!("📨 TCP: Received file data ({} bytes) from {}", data.len(), addr);
                    // Save received file data to the received directory
                    if let Some(file_name) = addr.ip().to_string().split(".").last() {
                        let received_file_path = Path::new(RECEIVED_DIR).join(format!("local_{}.json", file_name));
                        if let Err(e) = fs::write(&received_file_path, &data) {
                            eprintln!("Failed to save received file: {}", e);
                        } else {
                            println!("Saved received file to {}", received_file_path.display());
                        }
                    }
                }
                Message::SyncResponse(conversations) => {
                    println!("📥 TCP: Received {} conversations from {}", conversations.len(), addr);
                }
            }
        }
    }
}

pub async fn connect_to_peers(received_ips: Arc<Mutex<HashSet<String>>>) {
    loop {
        let mut ips = received_ips.lock().await;
        for ip in ips.drain() {
            let addr = format!("{0}:{1}", ip, PORT);
            match TcpStream::connect(&addr).await {
                Ok(mut stream) => {
                    println!("Connected to peer: {}", addr);
                    tokio::spawn(async move {
                        if let Err(e) = broadcast_local_conversation(&mut stream).await {
                            eprintln!("Failed to broadcast to {}: {}", addr, e);
                        }
                    });
                }
                Err(e) => eprintln!("Failed to connect to {}: {}", addr, e),
            }
        }
        drop(ips);
        sleep(Duration::from_secs(5)).await;
    }
}

async fn broadcast_local_conversation(stream: &mut TcpStream) -> std::io::Result<()> {
    loop {
        if let Some(_conversation) = CONVERSATION_STORE.get_conversation("local").await {
            let file_path = std::path::Path::new(crate::persistence::CONVERSATIONS_DIR)
                .join("local.json");
            if let Ok(metadata) = std::fs::metadata(&file_path) {
                Message::FileInfo {
                    path: file_path.clone(),
                    size: metadata.len(),
                }.send(stream).await?;
                
                let content = std::fs::read(&file_path)?;
                Message::FileData(content).send(stream).await?;
                println!("Broadcasted local conversation to {}", stream.peer_addr()?);
                println!("chat history sent successfully");
            }
        }
        sleep(Duration::from_secs(30)).await;
    }
}
