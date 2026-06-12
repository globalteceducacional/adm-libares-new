@echo off
title ADM Libare - Reset senha MySQL
cd /d "%~dp0"
echo.
echo Este assistente redefine a senha MySQL root para: root
echo E cria a base adm_libare.
echo.
echo Vai pedir permissao de Administrador (UAC). Clique SIM.
echo.
pause
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process powershell -Verb RunAs -Wait -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-File','\"%~dp0reset-mysql-password.ps1\"'"
echo.
echo Se viu [OK] na janela azul, feche-a e execute: start-backend.cmd
pause
