@echo off
echo ===== Fixing Ollama External Access =====
echo.

echo 1. Stopping Ollama...
taskkill /f /im ollama.exe 2>nul

echo.
echo 2. Adding Windows Firewall rules for Ollama...
netsh advfirewall firewall delete rule name="Ollama" 2>nul
netsh advfirewall firewall add rule name="Ollama TCP In" dir=in action=allow protocol=TCP localport=11434
netsh advfirewall firewall add rule name="Ollama TCP Out" dir=out action=allow protocol=TCP localport=11434

echo.
echo 3. Setting Ollama environment variables for external access...
set OLLAMA_HOST=0.0.0.0:11434
set OLLAMA_ORIGINS=*

echo.
echo 4. Starting Ollama with external access...
start /B ollama serve

echo.
echo 5. Waiting for Ollama to start...
timeout /t 5 /nobreak >nul

echo.
echo 6. Checking if Ollama is listening on all interfaces...
netstat -an | findstr 11434

echo.
echo 7. Testing Ollama API locally...
curl -s http://127.0.0.1:11434/api/tags

echo.
echo 8. Your IP addresses:
ipconfig | findstr "IPv4"

echo.
echo ===== Ollama should now be accessible externally =====
echo Tell your friend to try connecting again
pause