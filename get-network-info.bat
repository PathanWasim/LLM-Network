@echo off
echo ========================================
echo    NeuroMesh Network Information
echo ========================================
echo.

echo Your IP addresses:
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do echo %%a

echo.
echo Network interfaces:
ipconfig | findstr "adapter\|IPv4"

echo.
echo ========================================
echo Share this IP with your friend for manual connection
echo ========================================
pause