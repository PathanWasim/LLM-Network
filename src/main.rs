mod udp;
mod ip;
mod tcp;
mod llm;
mod conversation;
mod persistence;

use std::collections::HashSet;
use std::sync::Arc;
use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use actix_cors::Cors;
use rust_embed::Embed;
use tokio::sync::Mutex;
use udp::{periodic_broadcast, receive_broadcast};
use tcp::{connect_to_peers, listen_for_connections};

#[derive(Embed)]
#[folder = "./webpage/build/"]
struct WebAssets;

fn send_file_or_default(path: String) -> HttpResponse {
    let path = if path.starts_with("assets/") {
        path
    } else {
        path.trim_start_matches("/app/").to_string()
    };
    
    let asset = WebAssets::get(path.as_str());
    match asset {
        Some(file) => {
            let mime_type = mime_guess::from_path(&path).first_or_octet_stream();
            HttpResponse::Ok()
                .content_type(mime_type.to_string())
                .body(file.data)
        }
        None => {
            println!("Asset not found: {}", path);
            let index_asset = WebAssets::get("index.html");
            match index_asset {
                Some(index_file) => {
                    let mime_type = mime_guess::from_path("index.html").first_or_octet_stream();
                    HttpResponse::Ok()
                        .content_type(mime_type.to_string())
                        .body(index_file.data)
                }
                None => HttpResponse::NotFound().body("Not Found"),
            }
        }
    }
}

#[get("/app/")]
async fn get_index() -> impl Responder {
    send_file_or_default("index.html".to_string())
}

#[get("/app/{path:.*}")]
async fn get_root_files(path: actix_web::web::Path<String>) -> impl Responder {
    let path = path.into_inner();
    println!("path: {}", path);
    send_file_or_default(path)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    println!("\n=== LLM Network Instance Starting ===");
    println!("Initializing components...\n");

    // Initialize conversations directory
    if let Err(e) = persistence::init_conversations_dir().await {
        eprintln!("❌ Failed to initialize conversations directory: {}", e);
        return Err(e);
    }
    println!("✅ Conversations directory initialized");

    let received_ips = Arc::new(Mutex::new(HashSet::new()));
    let received_ips_clone = received_ips.clone();

    // Start UDP broadcast receiver
    println!("\n📡 Starting UDP broadcast receiver...");
    tokio::spawn(async move {
        if let Err(e) = receive_broadcast(received_ips_clone).await {
            eprintln!("❌ Error in UDP receiver task: {}", e);
        }
    });
    println!("✅ UDP broadcast receiver started");
    
    // Start TCP listener
    println!("\n🔌 Starting TCP connection listener...");
    tokio::spawn(listen_for_connections());
    println!("✅ TCP listener started");

    // Start UDP broadcaster
    println!("\n📢 Starting UDP broadcaster...");
    tokio::spawn(periodic_broadcast());
    println!("✅ UDP broadcaster started");

    // Start peer connector
    println!("\n🤝 Starting peer connector...");
    let received_ips_clone = received_ips.clone();
    tokio::spawn(connect_to_peers(received_ips_clone));
    println!("✅ Peer connector started");

    // Open web browser
    println!("\n🌐 Opening web interface...");
    match open::that("http://localhost:8080/app/") {
        Ok(()) => println!("✅ Web interface opened at http://localhost:8080/app/"),
        Err(err) => eprintln!("❌ Failed to open web interface: {}", err),
    };

    println!("\n🚀 Starting web server on http://localhost:8080/app/");
    
    // Start HTTP server
    HttpServer::new(|| {
        App::new()
        .wrap(
            Cors::default()
                .allow_any_origin()
                .allow_any_method()
                .allow_any_header()
        )
            .service(llm::chat)
            .service(get_index)
            .service(get_root_files)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
