@echo off
echo ========================================
echo    NeuroMesh - Neural Intelligence Mesh
echo ========================================
echo.

echo [1/2] Starting Neural LLM Service...
taskkill /F /IM ollama.exe 2>nul
timeout /t 2 /nobreak >nul

set OLLAMA_HOST=0.0.0.0
set OLLAMA_ORIGINS=*

"C:\Users\Acer\AppData\Local\Programs\Ollama\ollama.exe" serve &

echo [2/2] Starting NeuroMesh Network...
echo.
echo ========================================
echo    NeuroMesh is now running!
echo    Neural Interface: http://localhost:8080/app/
echo    Created by: Wasim
echo ========================================
echo.

cargo run --release