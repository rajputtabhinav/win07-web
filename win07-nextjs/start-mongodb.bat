@echo off
echo Starting MongoDB for WIN07 Gaming Platform...
echo.

REM Create data directory if it doesn't exist
if not exist "C:\data\db" (
    echo Creating MongoDB data directory...
    mkdir "C:\data\db"
)

echo Starting MongoDB server...
echo MongoDB will run on: mongodb://localhost:27017
echo Database: win07gaming
echo.

REM Start MongoDB
mongod --dbpath "C:\data\db" --port 27017

pause
