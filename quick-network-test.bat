@echo off
echo ===== Quick Network Troubleshooting for NeuroMesh =====
echo.

echo 1. Testing basic connectivity to friend's device...
ping -n 4 10.99.100.183

echo.
echo 2. Testing TCP port 7878 connectivity...
telnet 10.99.100.183 7878

echo.
echo 3. Checking for packet loss...
ping -n 10 -l 1024 10.99.100.183

echo.
echo 4. Testing UDP port 5000 (if available)...
echo This requires manual verification - check if UDP 5000 is open

echo.
echo 5. Network route to friend's device...
tracert -h 5 10.99.100.183

echo.
echo 6. Current network adapter settings...
ipconfig /all | findstr /i "10.99.100"

echo.
echo ===== Troubleshooting Complete =====
pause