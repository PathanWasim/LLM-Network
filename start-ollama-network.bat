@echo off
taskkill /F /IM ollama.exe 2>nul
timeout /t 2 /nobreak >nul

set OLLAMA_HOST=0.0.0.0
set OLLAMA_ORIGINS=*

"C:\Users\Omkar\AppData\Local\Programs\Ollama\ollama.exe" serve 