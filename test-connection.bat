@echo off
echo ===== NeuroMesh Connection Test =====
echo.

echo 1. Stopping existing processes...
taskkill /f /im neuromesh.exe 2>nul
taskkill /f /im ollama.exe 2>nul

echo.
echo 2. Starting Ollama with external access...
set OLLAMA_HOST=0.0.0.0
set OLLAMA_ORIGINS=*
start /B ollama serve

echo.
echo 3. Waiting for Ollama to start...
timeout /t 3 /nobreak >nul

echo.
echo 4. Checking Ollama is accessible...
netstat -an | findstr 11434

echo.
echo 5. Testing connection to friend's device...
ping -n 2 10.99.100.183

echo.
echo 6. Starting NeuroMesh...
echo Press Ctrl+C to stop when you want to end the test
.\target\release\neuromesh.exe

pause