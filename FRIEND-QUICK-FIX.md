# Quick Fix for Friend's Laptop

## The Problem
Your friend is getting "early eof" errors which means the TCP connection is being dropped unexpectedly.

## Quick Solutions (Try in order):

### 1. Run as Administrator
```cmd
# Right-click Command Prompt -> "Run as Administrator"
# Then navigate to the NeuroMesh folder and run:
.\target\release\neuromesh.exe
```

### 2. Add Firewall Rules
```cmd
# Run these commands as Administrator:
netsh advfirewall firewall add rule name="NeuroMesh TCP In" dir=in action=allow protocol=TCP localport=7878
netsh advfirewall firewall add rule name="NeuroMesh UDP In" dir=in action=allow protocol=UDP localport=5000
netsh advfirewall firewall add rule name="NeuroMesh TCP Out" dir=out action=allow protocol=TCP remoteport=7878
netsh advfirewall firewall add rule name="NeuroMesh UDP Out" dir=out action=allow protocol=UDP remoteport=5000
```

### 3. Temporarily Disable Antivirus
- Temporarily disable real-time protection in Windows Defender or your antivirus
- Try running NeuroMesh again
- Re-enable protection after testing

### 4. Network Reset (if still having issues)
```cmd
# Run as Administrator:
netsh winsock reset
netsh int tcp reset
ipconfig /flushdns
# Then restart the computer
```

### 5. Use the Debug Script
Copy the `friend-debug-run.bat` file to your friend's laptop and run it. This will:
- Check network connectivity
- Add firewall rules automatically
- Run NeuroMesh with better error handling

## What Should Work Now:
- The "unexpected message" error should be gone
- Connection drops should recover automatically
- LLM access requests should be more reliable
- Better error messages to help diagnose issues

## Expected Output:
Your friend should see:
```
UDP: Discovered peer 10.99.100.19 (LLM available: true)
TCP: Connected to 10.99.100.19:7878
TCP: Successfully sent LLM access request to 10.99.100.19:7878
TCP: LLM access granted by 10.99.100.19:7878 - Access granted automatically
TCP: LLM connection details stored for 10.99.100.19:7878 (10.99.100.19:11434)
```

If it's still not working, the issue might be:
1. Router blocking peer-to-peer connections (AP isolation)
2. ISP blocking certain ports
3. Network adapter power management turning off the connection

Try connecting both devices to a mobile hotspot as a test to rule out router issues.