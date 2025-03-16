// LLM module for language model related functionality
use actix_web::{post, web, HttpResponse, Error};
use serde::{Deserialize, Serialize};
use reqwest::Client;
use chrono::Utc;
use crate::conversation::{ChatMessage, CONVERSATION_STORE};

const OLLAMA_HOST: &str = "http://127.0.0.1:11434";

#[derive(Deserialize)]
pub struct ChatRequest {
    message: String,
    sender: String,
}

#[derive(Serialize, Deserialize)]
struct OllamaRequest {
    model: String,
    prompt: String,
    stream: bool,
}

#[derive(Serialize, Deserialize)]
struct OllamaResponse {
    model: String,
    created_at: String,
    message: OllamaMessage,
    done: bool,
}

#[derive(Serialize, Deserialize)]
struct OllamaMessage {
    role: String,
    content: String,
}

#[post("/chat")]
pub async fn chat(req: web::Json<ChatRequest>) -> Result<HttpResponse, Error> {
    let client = Client::new();
    
    let ollama_req = OllamaRequest {
        model: "qwen2.5-coder7b".to_string(),
        prompt: req.message.clone(),
        stream: false,
    };

    let response = client
        .post(format!("{}/api/chat", OLLAMA_HOST))
        .json(&ollama_req)
        .send()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    let ollama_response = response
        .json::<OllamaResponse>()
        .await
        .map_err(|e| actix_web::error::ErrorInternalServerError(e))?;

    let chat_message = ChatMessage {
        content: ollama_response.message.content,
        timestamp: Utc::now(),
        sender: req.sender.clone(),
    };

    CONVERSATION_STORE.add_message("local".to_string(), chat_message.clone()).await;

    Ok(HttpResponse::Ok().json(chat_message))
}