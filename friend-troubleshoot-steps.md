# Quick NeuroMesh Troubleshooting Steps for Friend's Laptop

## Immediate Steps to Try:

### 1. Run Network Test
```cmd
# Copy and run this on friend's laptop
ping -n 4 YOUR_IP_HERE
# Replace YOUR_IP_HERE with your actual IP
```

### 2. Check if NeuroMesh is running properly
```cmd
# Check if NeuroMesh process is running
tasklist | findstr neuromesh

# Check if ports are listening
netstat -an | findstr 7878
netstat -an | findstr 5000
```

### 3. Restart NeuroMesh with verbose logging
```cmd
# Stop existing processes
taskkill /f /im neuromesh.exe
taskkill /f /im ollama.exe

# Start fresh
neuromesh.exe
```

### 4. Windows Firewall Quick Fix
```cmd
# Run as Administrator
netsh advfirewall firewall add rule name="NeuroMesh TCP" dir=in action=allow protocol=TCP localport=7878
netsh advfirewall firewall add rule name="NeuroMesh UDP" dir=in action=allow protocol=UDP localport=5000
```

### 5. Network Adapter Reset
```cmd
# Run as Administrator
netsh winsock reset
netsh int tcp reset
ipconfig /flushdns
```

## What to Look For:

### Good Signs:
- `UDP: Discovered peer [IP]` messages
- `TCP: Connected to [IP]:7878` messages
- `TCP: Successfully sent file` messages

### Bad Signs:
- `TCP: Timeout reading marker`
- `TCP: early eof` errors
- No UDP discovery messages
- Connection refused errors

## Quick Fixes to Try:

1. **Antivirus**: Temporarily disable real-time protection
2. **Windows Defender**: Add NeuroMesh folder to exclusions
3. **Network**: Switch to mobile hotspot temporarily to test
4. **Restart**: Both devices, then try again

## If Still Not Working:

1. Check router settings for AP isolation
2. Try connecting both devices to same mobile hotspot
3. Use Windows built-in troubleshooter: `msdt.exe -id NetworkDiagnosticsNetworkAdapter`

## Emergency Contact Method:
If nothing works, use phone/messaging to coordinate next steps.