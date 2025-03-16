use std::path::Path;
use tokio::fs;

pub const CONVERSATIONS_DIR: &str = "conversations";

pub async fn init_conversations_dir() -> std::io::Result<()> {
    let path = Path::new(CONVERSATIONS_DIR);
    if !path.exists() {
        fs::create_dir_all(path).await?;
    }
    Ok(())
} 