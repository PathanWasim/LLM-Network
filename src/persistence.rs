use std::path::Path;
use tokio::fs;
use serde_json;
use crate::conversation::{Conversation, CONVERSATION_STORE};

pub const CONVERSATIONS_DIR: &str = "conversations";

pub async fn init_conversations_dir() -> std::io::Result<()> {
    let path = Path::new(CONVERSATIONS_DIR);
    if !path.exists() {
        fs::create_dir_all(path).await?;
    }
    Ok(())
}

pub async fn save_conversation(conversation_id: &str, conversation: &Conversation) -> std::io::Result<()> {
    let file_path = Path::new(CONVERSATIONS_DIR).join(format!("{}.json", conversation_id));
    let json = serde_json::to_string_pretty(conversation)?;
    fs::write(file_path, json).await?;
    Ok(())
}

pub async fn load_conversation(conversation_id: &str) -> std::io::Result<Option<Conversation>> {
    let file_path = Path::new(CONVERSATIONS_DIR).join(format!("{}.json", conversation_id));
    if !file_path.exists() {
        return Ok(None);
    }
    
    let content = fs::read_to_string(file_path).await?;
    let conversation = serde_json::from_str(&content)?;
    Ok(Some(conversation))
}

pub async fn load_all_conversations() -> std::io::Result<()> {
    let path = Path::new(CONVERSATIONS_DIR);
    let mut entries = fs::read_dir(path).await?;
    
    while let Some(entry) = entries.next_entry().await? {
        if let Some(extension) = entry.path().extension() {
            if extension == "json" {
                if let Some(stem) = entry.path().file_stem() {
                    if let Some(conversation_id) = stem.to_str() {
                        if let Ok(Some(conversation)) = load_conversation(conversation_id).await {
                            for message in conversation.messages {
                                CONVERSATION_STORE.add_message(conversation_id.to_string(), message).await;
                            }
                        }
                    }
                }
            }
        }
    }
    
    Ok(())
} 