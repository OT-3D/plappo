@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Plappo Server
cls
echo.
echo   ===========================================================
echo            P L A P P O  -  Sprechen lernen mit Pepe
echo   ===========================================================
echo.

rem --- find this PC's WLAN/LAN IPv4 address ---
set "IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  if not defined IP set "IP=%%a"
)
set "IP=%IP: =%"

echo   So spielst du:
echo.
echo   1) Auf DIESEM PC:        http://localhost:8080
if defined IP (
echo   2) Auf iPhone / iPad:    http://%IP%:8080
echo      ^(iPhone/iPad muss im gleichen WLAN sein wie dieser PC^)
) else (
echo   2) Auf iPhone / iPad:    http://[PC-IP-Adresse]:8080
echo      ^(IP-Adresse mit 'ipconfig' herausfinden^)
)
echo.
echo   So wird daraus eine App-Kachel:
echo      Safari oeffnen  ^>  Teilen-Symbol  ^>  "Zum Home-Bildschirm"
echo.
echo   Falls Windows nach der Firewall fragt: "Zugriff zulassen".
echo   Zum Beenden dieses Fenster schliessen.
echo.
echo   -----------------------------------------------------------
echo.

rem --- start the static server (binds to all interfaces for LAN access) ---
py -3 -m http.server 8080 --bind 0.0.0.0 2>nul
if errorlevel 1 (
  rem fallback if the 'py' launcher is not available
  python -m http.server 8080 --bind 0.0.0.0
)
