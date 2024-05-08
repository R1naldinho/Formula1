@echo off

REM Avvia XAMPP
start "" "C:\xampp\xampp-control.exe"
timeout /t 1

start "" "C:\xampp\apache_start.bat"
timeout /t 1

start "" "C:\xampp\mysql_start.bat"
timeout /t 3

REM Avvia PHPMyAdmin
start "" "http://localhost/phpmyadmin/"
timeout /t 3

REM Avvia il server backend con nodemon
cd backend
start cmd /k nodemon server.js
timeout /t 3

REM Avvia il frontend
cd ../frontend
start "" "file:///C:/Users/dimam/OneDrive/Desktop/F1_API/FrontEnd/index.html"

REM Avvia vscode
start "" "C:\Users\dimam\AppData\Local\Programs\Microsoft VS Code\Code.exe"
