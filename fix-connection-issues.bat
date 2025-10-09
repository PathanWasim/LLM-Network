@echo off
echo ========================================
echo    NeuroMesh Connection Fix
echo ========================================
echo.

echo Adding Windows Firewall rules...
netsh advfirewall firewall add rule name="NeuroMesh UDP" dir=in action=allow protocol=UDP localport=5000
netsh advfirewall firewall add rule name="NeuroMesh TCP" dir=in action=allow protocol=TCP localport=7878
netsh advfirewall firewall add rule name="NeuroMesh HTTP" dir=in action=allow protocol=TCP localport=8080
netsh advfirewall firewall add rule name="NeuroMesh Ollama" dir=in action=allow protocol=TCP localport=11434

echo.
echo Adding outbound rules...
netsh advfirewall firewall add rule name="NeuroMesh UDP Out" dir=out action=allow protocol=UDP localport=5000
netsh advfirewall firewall add rule name="NeuroMesh TCP Out" dir=out action=allow protocol=TCP localport=7878

echo.
echo ✅ Firewall rules added!
echo Now restart NeuroMesh on both computers
echo ========================================
pause