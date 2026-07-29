@echo off
echo Starting WIN07 Gaming Platform for Mobile Testing...
echo.
echo Your Local IP: 192.168.1.17
echo.
echo Access URLs:
echo   Local:   http://localhost:3000
echo   Mobile:  http://192.168.1.17:3000
echo.
echo Make sure your mobile device is on the same Wi-Fi network!
echo.
echo Starting server...
npx next dev --turbopack --hostname 0.0.0.0 --port 3000
pause
