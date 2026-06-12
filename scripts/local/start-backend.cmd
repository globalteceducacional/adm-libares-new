@echo off
title ADM Libare - Backend
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1"
echo.
pause
