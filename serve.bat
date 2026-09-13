@echo off
rem Serve the site at http://localhost:8000 (or the port given as the first argument).
cd /d "%~dp0"
set PORT=%1
if "%PORT%"=="" set PORT=8000
echo Neuro Longevity Care running at http://localhost:%PORT%  (Ctrl+C to stop)
python -m http.server %PORT% --bind 127.0.0.1
