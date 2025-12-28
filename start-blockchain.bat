@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   TerraLedger Local Blockchain Setup
echo ==========================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo Node.js and npm are installed
echo.

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install --quiet
    echo Dependencies installed
    echo.
)

echo Starting Hardhat Node...
echo (This will run a local blockchain at http://localhost:8545)
echo.
echo IMPORTANT: Keep this window open while developing.
echo You can stop it anytime with Ctrl+C
echo.
echo ==========================================
echo.

call npx hardhat node

pause
