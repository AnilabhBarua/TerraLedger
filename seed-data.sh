#!/bin/bash

set -e

echo "=========================================="
echo "  TerraLedger - Seed Test Data"
echo "=========================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Checking if Hardhat node is running..."
if ! nc -z localhost 8545 2>/dev/null; then
    echo "Error: Hardhat node is not running!"
    echo ""
    echo "Please start the Hardhat node first:"
    echo "  ./start-blockchain.sh"
    exit 1
fi

echo "✓ Hardhat node is running"
echo ""
echo "Seeding test properties..."
echo ""

cd "$PROJECT_DIR"
npx hardhat run scripts/seed-properties.ts --network localhost

echo ""
echo "=========================================="
echo "✓ Seeding complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open the app in your browser (usually http://localhost:5173)"
echo "2. Connect your MetaMask wallet"
echo "3. Switch to 'Localhost 31337' network"
echo "4. Import test accounts from the list above"
echo "5. Try registering or transferring properties!"
echo ""
