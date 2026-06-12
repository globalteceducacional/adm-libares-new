@echo off
title ADM Libare - Verificar MySQL
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0verify-mysql.ps1"
echo.
pause
