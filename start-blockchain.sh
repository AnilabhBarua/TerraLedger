#!/bin/bash

set -e

echo "=========================================="
echo "  TerraLedger Local Blockchain Setup"
echo "=========================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ Node.js and npm are installed"
echo ""

if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "Installing dependencies..."
    cd "$PROJECT_DIR"
    npm install --quiet
    echo "✓ Dependencies installed"
    echo ""
fi

echo "Starting Hardhat Node..."
echo "(This will run a local blockchain at http://localhost:8545)"
echo ""
echo "IMPORTANT: Keep this terminal open while developing."
echo "You can stop it anytime with Ctrl+C"
echo ""
echo "=========================================="
echo ""

cd "$PROJECT_DIR"
npx hardhat node
