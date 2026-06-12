@echo off
REM Abre o reset da senha MySQL em janela elevada (UAC).
cd /d "%~dp0..\.."
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-File','\"%~dp0reset-mysql-password.ps1\"'"
