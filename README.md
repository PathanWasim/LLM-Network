# NeuroMesh - Distributed LLM Network

NeuroMesh is a peer-to-peer network that allows sharing of Large Language Model (LLM) capabilities across multiple devices. Connect to friends and access their LLMs seamlessly.

## Quick Start

### Prerequisites
- [Ollama](https://ollama.ai/) installed (for hosting LLMs)
- Windows Firewall configured (see setup below)

### Setup

1. **Download NeuroMesh**: Get the latest release or build from source
2. **Install Ollama**: Download from [ollama.ai](https://ollama.ai/)
3. **Pull a model**: `ollama pull llama3.2` (or any model you prefer)
4. **Configure Firewall**: Run `admin-firewall-fix.bat` as Administrator
5. **Start NeuroMesh**: Run `run-neuromesh.bat`

### Firewall Configuration (Required)

**Run as Administrator:**
```cmd
netsh advfirewall firewall add rule name="NeuroMesh TCP" dir=in action=allow protocol=TCP localport=7878
netsh advfirewall firewall add rule name="NeuroMesh UDP" dir=in action=allow protocol=UDP localport=5000
netsh advfirewall firewall add rule name="Ollama" dir=in action=allow protocol=TCP localport=11434
```

Or simply run `admin-firewall-fix.bat` as Administrator.

## Usage

### Hosting an LLM
1. Run `run-neuromesh.bat`
2. Your LLM will be automatically shared with discovered peers
3. Open web interface at `http://localhost:3000`

### Connecting to Friends
1. Ensure both devices are on the same network
2. Run NeuroMesh on both devices
3. Peers will be automatically discovered
4. Access remote LLMs through the web interface

## Files

- `run-neuromesh.bat` - Main startup script
- `admin-firewall-fix.bat` - Firewall configuration (run as admin)
- `target/release/neuromesh.exe` - Main executable
- `FRIEND_SETUP_GUIDE.md` - Setup guide for friends

## Troubleshooting

### Common Issues
- **Peers not found**: Check firewall rules and network connectivity
- **LLM access denied**: Ensure Ollama is running and accessible
- **Connection drops**: Normal behavior, system recovers automatically

### Network Requirements
- Same WiFi network or VPN
- Ports 5000 (UDP), 7878 (TCP), 11434 (TCP) open
- No AP isolation on router

## Building from Source

```bash
git clone <repository-url>
cd neuromesh
cargo build --release
```

## Security Note
NeuroMesh automatically shares LLMs with discovered peers. Only use on trusted networks.