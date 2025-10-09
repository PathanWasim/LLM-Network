@echo off
echo ========================================
echo    NeuroMesh Network Diagnostics
echo ========================================
echo.

echo Your IP addresses:
ipconfig | findstr "IPv4"

echo.
echo Testing network connectivity...
echo Checking if ports are open:
netstat -an | findstr ":5000\|:7878\|:8080\|:11434"

echo.
echo Testing UDP broadcast:
ping -n 1 255.255.255.255

echo.
echo ========================================
echo Share your IP with friends for manual connection
echo Make sure both computers are on same network
echo ========================================
pause