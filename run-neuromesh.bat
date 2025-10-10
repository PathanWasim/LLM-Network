@echo off
echo ===== NeuroMesh Startup =====
echo.

echo 1. Checking and configuring firewall (one-time setup)...
netsh advfirewall firewall show rule name="NeuroMesh TCP" >nul 2>&1
if %errorlevel% neq 0 (
    echo Adding firewall rules...
    netsh advfirewall firewall add rule name="NeuroMesh TCP" dir=in action=allow protocol=TCP localport=7878 >nul 2>&1
    netsh advfirewall firewall add rule name="NeuroMesh UDP" dir=in action=allow protocol=UDP localport=5000 >nul 2>&1
    netsh advfirewall firewall add rule name="Ollama" dir=in action=allow protocol=TCP localport=11434 >nul 2>&1
    echo Firewall configured!
) else (
    echo Firewall already configured.
)

echo.
echo 2. Stopping existing processes...
taskkill /f /im neuromesh.exe 2>nul
taskkill /f /im ollama.exe 2>nul

echo.
echo 3. Waiting for processes to stop...
timeout /t 3 /nobreak >nul

echo.
echo 4. Checking if Ollama is still running...
netstat -an | findstr 11434 >nul 2>&1
if %errorlevel% == 0 (
    echo Ollama is already running - using existing instance
    goto start_neuromesh
)

echo.
echo 5. Starting Ollama with external access...
set OLLAMA_HOST=0.0.0.0
set OLLAMA_ORIGINS=*
echo Using optimized qwen3-fast model for better performance...
start /B ollama serve

echo.
echo 6. Waiting for Ollama to start...
timeout /t 5 /nobreak >nul

:start_neuromesh
echo.
echo 7. Starting NeuroMesh...
echo Open http://localhost:3000 in your browser
echo.
.\target\release\neuromesh.exe

pause