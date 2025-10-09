# 🛡️ Antivirus Exclusion Guide for NeuroMesh

## Why is NeuroMesh flagged?

NeuroMesh is flagged as a false positive because:
- **Network Activity**: Opens multiple ports for peer communication
- **Unsigned Binary**: Not digitally signed (costs $100-300/year)
- **New Software**: Antivirus doesn't recognize the signature

## ✅ How to Add Exclusions

### Windows Defender
1. Open **Windows Security** → **Virus & threat protection**
2. Click **Manage settings** under "Virus & threat protection settings"
3. Click **Add or remove exclusions**
4. Add these exclusions:
   - **File**: `neuromesh.exe`
   - **Folder**: Your NeuroMesh project folder
   - **Process**: `neuromesh.exe`

### McAfee
1. Open McAfee → **Real-Time Scanning**
2. Click **Excluded Files**
3. Add `neuromesh.exe` and project folder

### Norton
1. Open Norton → **Settings** → **Antivirus**
2. Click **Scans and Risks** → **Exclusions/Low Risks**
3. Add file and folder exclusions

### Avast/AVG
1. Open Avast → **Menu** → **Settings**
2. Go to **General** → **Exceptions**
3. Add file path exclusions

## 🔒 Security Verification

You can verify NeuroMesh is safe by:
1. **Building from source** (recommended)
2. **Checking the code** on GitHub
3. **Running in isolated environment** first
4. **Scanning with multiple antivirus** tools

## 📞 For IT Administrators

NeuroMesh is a legitimate peer-to-peer AI network application that:
- Uses standard TCP/UDP protocols
- Has open-source code available
- Requires network access for peer discovery
- Is built with Rust (memory-safe language)

**Whitelist Rules:**
- Process: `neuromesh.exe`
- Ports: 5000/UDP, 7878/TCP, 8080/HTTP, 11434/HTTP
- Network: Local subnet broadcast and peer connections