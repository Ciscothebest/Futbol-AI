@echo off
title FutbolAI — Iniciando...
color 0A

echo.
echo  ========================================
echo    ⚽  FUTBOLAI — Plataforma de Futbol
echo  ========================================
echo.
echo  Iniciando servidor backend...
echo.

cd /d "%~dp0backend"

:: Verificar si Node.js está instalado
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ❌ Node.js no encontrado. Instálalo en nodejs.org
    pause
    exit /b 1
)

:: Arrancar el backend en segundo plano
start "FutbolAI Backend" cmd /k "node server.js"

:: Esperar 2 segundos para que el server arranque
timeout /t 2 /nobreak >nul

echo  ✅ Backend corriendo en http://localhost:3001
echo.
echo  Abriendo FutbolAI en el navegador...
echo.

:: Abrir el frontend en el navegador por defecto
start "" "%~dp0frontend\index.html"

echo  ✅ FutbolAI iniciado correctamente
echo.
echo  Para detener el servidor, cierra la ventana "FutbolAI Backend"
echo.
timeout /t 3 /nobreak >nul
exit
