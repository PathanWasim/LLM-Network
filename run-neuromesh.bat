@echo off
echo ===== NeuroMesh Startup =====
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
echo 4. Starting NeuroMesh...
.\target\release\neuromesh.exe

pause