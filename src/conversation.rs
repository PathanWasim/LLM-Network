use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::Mutex;
use lazy_static::lazy_static;
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub content: String,
    pub timestamp: DateTime<Utc>,
    pub sender: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Conversation {
    pub id: String,
    pub messages: Vec<ChatMessage>,
}

pub struct ConversationStore {
    conversations: Mutex<HashMap<String, Conversation>>,
}

impl ConversationStore {
    pub fn new() -> Self {
        ConversationStore {
            conversations: Mutex::new(HashMap::new()),
        }
    }

    pub async fn add_message(&self, conversation_id: String, message: ChatMessage) {
        let mut conversations = self.conversations.lock().await;
        let conversation = conversations.entry(conversation_id.clone()).or_insert(Conversation {
            id: conversation_id,
            messages: Vec::new(),
        });
        conversation.messages.push(message);
    }

    pub async fn get_conversation(&self, conversation_id: &str) -> Option<Conversation> {
        let conversations = self.conversations.lock().await;
        conversations.get(conversation_id).cloned()
    }

    pub async fn get_all_conversations(&self) -> Vec<Conversation> {
        let conversations = self.conversations.lock().await;
        conversations.values().cloned().collect()
    }
}

lazy_static! {
    pub static ref CONVERSATION_STORE: ConversationStore = ConversationStore::new();
} 