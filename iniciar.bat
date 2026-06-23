@echo off
title FutbolAI - Servidor
color 0A
echo.
echo  ===================================
echo    FUTBOLAI - Iniciando servidor...
echo  ===================================
echo.
cd /d "%~dp0"
node backend/server.js
pause
