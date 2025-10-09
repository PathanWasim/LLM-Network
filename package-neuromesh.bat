@echo off
echo ========================================
echo    Creating NeuroMesh Portable Package
echo ========================================
echo.

echo Creating package directory...
mkdir NeuroMesh-Portable 2>nul

echo Copying files...
copy target\release\neuromesh.exe NeuroMesh-Portable\
copy start-neuromesh.bat NeuroMesh-Portable\
copy README.md NeuroMesh-Portable\
copy ANTIVIRUS_GUIDE.md NeuroMesh-Portable\

echo Creating instructions...
echo # NeuroMesh Portable Package > NeuroMesh-Portable\INSTRUCTIONS.txt
echo. >> NeuroMesh-Portable\INSTRUCTIONS.txt
echo 1. Add this folder to antivirus exclusions >> NeuroMesh-Portable\INSTRUCTIONS.txt
echo 2. Run start-neuromesh.bat >> NeuroMesh-Portable\INSTRUCTIONS.txt
echo 3. Open http://localhost:8080/app/ >> NeuroMesh-Portable\INSTRUCTIONS.txt
echo. >> NeuroMesh-Portable\INSTRUCTIONS.txt
echo This is safe software - see ANTIVIRUS_GUIDE.md >> NeuroMesh-Portable\INSTRUCTIONS.txt

echo.
echo ✅ Package created in NeuroMesh-Portable folder
echo Share this folder instead of just the .exe file
echo ========================================
pause