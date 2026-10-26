@echo off
title Grandmaster OS — The Private Chess Academy
cd /d "%~dp0"
if not exist "dist\index.html" (
    echo Building Grandmaster OS for first-time launch...
    call npm run build
)
echo Starting Grandmaster OS Desktop App...
start "" wscript.exe "%~dp0scripts\silent-launch.vbs"
