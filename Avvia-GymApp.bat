@echo off
title Gym Builder
echo ===================================================
echo     Gym Builder - Schede e Tracciamento Pesi
echo ===================================================
echo.
echo Avvio del server locale in corso...
echo.
start "" http://localhost:5173
call npm.cmd run dev
pause
