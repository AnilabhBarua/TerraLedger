@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   TerraLedger - Seed Test Data
echo ==========================================
echo.

echo Checking if Hardhat node is running...
(
    timeout /t 1 /nobreak >nul 2>&1
) < nul >nul 2>&1 || (
    powershell -Command "(New-Object Net.Sockets.TcpClient).ConnectAsync('127.0.0.1', 8545)" -ErrorAction SilentlyContinue | Out-Null
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Hardhat node is not running!
        echo.
        echo Please start the Hardhat node first:
        echo   start-blockchain.bat
        pause
        exit /b 1
    )
)

echo Hardhat node is running
echo.
echo Seeding test properties...
echo.

call npx hardhat run scripts/seed-properties.ts --network localhost

echo.
echo ==========================================
echo Seeding complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Open the app in your browser (usually http://localhost:5173)
echo 2. Connect your MetaMask wallet
echo 3. Switch to 'Localhost 31337' network
echo 4. Import test accounts from the list above
echo 5. Try registering or transferring properties!
echo.
pause
