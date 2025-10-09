@echo off
echo ===== NeuroMesh Debug Run for Friend's Laptop =====
echo.

echo 1. Stopping any existing NeuroMesh processes...
taskkill /f /im neuromesh.exe 2>nul

echo.
echo 2. Checking network connectivity to your device...
ping -n 2 10.99.100.19

echo.
echo 3. Checking if ports are accessible...
telnet 10.99.100.19 7878

echo.
echo 4. Checking Windows Firewall...
netsh advfirewall firewall show rule name="NeuroMesh" 2>nul
if errorlevel 1 (
    echo Adding firewall rules...
    netsh advfirewall firewall add rule name="NeuroMesh TCP" dir=in action=allow protocol=TCP localport=7878
    netsh advfirewall firewall add rule name="NeuroMesh UDP" dir=in action=allow protocol=UDP localport=5000
    netsh advfirewall firewall add rule name="NeuroMesh TCP Out" dir=out action=allow protocol=TCP localport=7878
    netsh advfirewall firewall add rule name="NeuroMesh UDP Out" dir=out action=allow protocol=UDP localport=5000
)

echo.
echo 5. Starting NeuroMesh with debug info...
echo Watch for connection status and any error messages
echo.
.\target\release\neuromesh.exe

pause