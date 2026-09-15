@echo off
cd /d "%~dp0"
start "Canopy Server" cmd /c "python -m http.server 8765"
timeout /t 2 >nul
start "Canopy" http://localhost:8765/index.html
