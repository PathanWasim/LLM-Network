@echo off
echo ===== Adding Firewall Rules (Run as Administrator) =====
echo.

echo Checking if running as Administrator...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo Running as Administrator - Good!
) else (
    echo ERROR: This script must be run as Administrator
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo Adding Windows Firewall rules for Ollama...
netsh advfirewall firewall delete rule name="Ollama TCP In" 2>nul
netsh advfirewall firewall delete rule name="Ollama TCP Out" 2>nul
netsh advfirewall firewall add rule name="Ollama TCP In" dir=in action=allow protocol=TCP localport=11434
netsh advfirewall firewall add rule name="Ollama TCP Out" dir=out action=allow protocol=TCP localport=11434

echo.
echo Adding Windows Firewall rules for NeuroMesh...
netsh advfirewall firewall delete rule name="NeuroMesh TCP In" 2>nul
netsh advfirewall firewall delete rule name="NeuroMesh UDP In" 2>nul
netsh advfirewall firewall add rule name="NeuroMesh TCP In" dir=in action=allow protocol=TCP localport=7878
netsh advfirewall firewall add rule name="NeuroMesh UDP In" dir=in action=allow protocol=UDP localport=5000

echo.
echo Firewall rules added successfully!
echo Your friend should now be able to access your Ollama server.
pause