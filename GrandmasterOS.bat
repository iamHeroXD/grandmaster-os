@echo off
title Grandmaster OS — The Private Chess Academy
cd /d "%~dp0"

if exist "GrandmasterOS.exe" (
    start "" "%~dp0GrandmasterOS.exe"
    exit /b 0
)

:: Fallback if .exe is not present
node "%~dp0scripts\desktop-server.js"
