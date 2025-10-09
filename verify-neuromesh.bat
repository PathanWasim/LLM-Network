@echo off
echo ========================================
echo    NeuroMesh Security Verification
echo ========================================
echo.

echo Generating SHA256 checksum for neuromesh.exe...
certutil -hashfile target\release\neuromesh.exe SHA256

echo.
echo File Information:
dir target\release\neuromesh.exe

echo.
echo ========================================
echo Share this checksum with friends to verify
echo the file integrity and authenticity.
echo ========================================
pause