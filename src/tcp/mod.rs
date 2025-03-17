use tokio::net::{TcpStream, TcpListener};
use tokio::io::{AsyncWriteExt, AsyncReadExt};
use tokio::sync::Mutex;
use tokio::time::sleep;
use std::sync::Arc;
use std::time::Duration;
use std::path::{Path, PathBuf};
use std::collections::HashSet;
use tokio::fs;
use crate::conversation::{ChatMessage, Conversation, CONVERSATION_STORE};
use crate::persistence::CONVERSATIONS_DIR;

const RECEIVED_DIR: &str = "received";
const PORT: i32 = 7878;
const SYNC_INTERVAL: Duration = Duration::from_secs(30);

#[derive(Debug)]
enum Message {
    ConversationFile {
        name: String,
        content: String,
    },
    SyncRequest,
    SyncResponse(Vec<Conversation>),
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
            _ => Err(std::io::Error::new(std::io::ErrorKind::InvalidData, "Unknown message type")),
        }
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
                    // Send all local conversations
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
