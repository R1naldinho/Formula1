@echo off

REM Chiudi il server backend nodemon
taskkill /f /im node.exe /t >nul

REM Chiudi XAMPP
taskkill /f /im xampp-control.exe /t >nul
timeout /t 1

REM Chiudi Apache
taskkill /f /im httpd.exe /t >nul
timeout /t 1

REM Chiudi MySQL
taskkill /f /im mysqld.exe /t >nul
timeout /t 1
