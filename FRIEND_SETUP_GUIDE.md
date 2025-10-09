# 🧠 NeuroMesh Setup Guide for Friends

## ⚠️ IMPORTANT: Follow these steps IN ORDER!

### Step 1: Fix Antivirus (REQUIRED)
1. **Windows Defender**: Settings → Virus & threat protection → Exclusions → Add folder
2. **Add the entire NeuroMesh folder** to exclusions
3. **Other antivirus**: Add folder to whitelist/exclusions

### Step 2: Fix Firewall (REQUIRED)
**Run as Administrator:**
```cmd
fix-connection-issues.bat
```
This adds firewall rules for ports 5000, 7878, 8080, 11434

### Step 3: Network Check
**Run this to see your network info:**
```cmd
network-test.bat
```

### Step 4: Start NeuroMesh
```cmd
start-neuromesh.bat
```

## 🔧 If Still Having Connection Issues:

### Manual Firewall Setup:
1. Windows Firewall → Advanced Settings
2. Inbound Rules → New Rule → Port
3. Add these ports: **5000 (UDP), 7878 (TCP), 8080 (TCP), 11434 (TCP)**
4. Allow the connection

### Network Requirements:
- **Same WiFi network** as other NeuroMesh users
- **No VPN** running (can block peer discovery)
- **Router allows local communication** (most do by default)

### Troubleshooting Commands:
```cmd
# Check if NeuroMesh is running
netstat -an | findstr ":5000\|:7878\|:8080"

# Test network connectivity
ping [friend's IP address]

# Check your IP
ipconfig | findstr "IPv4"
```

## 🚀 Success Indicators:
- ✅ UDP: Broadcasting to network
- ✅ TCP: Connected to peers
- ✅ Web interface: http://localhost:8080/app/
- ✅ LLM: Available (if Ollama installed)

## 💡 Common Issues:
- **"early eof"**: Firewall blocking connections
- **"LLM available: false"**: Ollama not installed/running
- **No peers found**: Different networks or firewall issues
- **Virus warning**: Add to antivirus exclusions

**Need help? Share your error messages and network info!**