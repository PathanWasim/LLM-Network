@echo off
echo ===== TCP Connection Issue Fixes =====
echo.

echo 1. Stopping any existing NeuroMesh processes...
taskkill /f /im neuromesh.exe 2>nul
taskkill /f /im ollama.exe 2>nul

echo.
echo 2. Clearing TCP connection cache...
netsh int tcp reset
netsh winsock reset catalog

echo.
echo 3. Adjusting Windows TCP settings for better stability...
netsh int tcp set global autotuninglevel=normal
netsh int tcp set global chimney=enabled
netsh int tcp set global rss=enabled

echo.
echo 4. Flushing DNS cache...
ipconfig /flushdns

echo.
echo 5. Checking Windows Firewall rules for NeuroMesh...
netsh advfirewall firewall show rule name="NeuroMesh" 2>nul
if errorlevel 1 (
    echo Adding firewall rules for NeuroMesh...
    netsh advfirewall firewall add rule name="NeuroMesh TCP" dir=in action=allow protocol=TCP localport=7878
    netsh advfirewall firewall add rule name="NeuroMesh UDP" dir=in action=allow protocol=UDP localport=5000
    netsh advfirewall firewall add rule name="Ollama" dir=in action=allow protocol=TCP localport=11434
)

echo.
echo 6. Restarting network adapter...
echo Please manually disable and re-enable your Wi-Fi adapter if issues persist

echo.
echo ===== TCP Fixes Applied =====
echo Please restart both devices and try NeuroMesh again
pause