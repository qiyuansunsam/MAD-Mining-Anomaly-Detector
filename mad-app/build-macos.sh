#!/bin/bash
# Build script for macOS distributions

set -e

echo "🍎 Building Anomaly Detector for macOS..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "⚠️  This script should be run on macOS for best results."
    echo "   Cross-compilation may have issues with code signing and notarization."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build React app
echo "⚛️ Building React application..."
npm run build

# Build macOS distributions
echo "🏗️ Building macOS distributions..."

# Build DMG (Intel)
echo "💿 Building DMG for Intel Macs..."
npm run dist:mac:dmg

# Build ZIP archives for both architectures
echo "🗜️ Building ZIP archives..."
npm run dist:mac:zip

echo "✅ macOS builds completed!"
echo "📁 Check the 'dist' folder for your macOS distributions:"
ls -la dist/ | grep -E "\.(dmg|zip)$" || echo "No macOS builds found in dist/"

echo ""
echo "🚀 macOS build artifacts:"
echo "  - DMG: Disk image for easy installation"
echo "  - ZIP: Archive for manual installation"
echo ""
echo "⚠️  Note: macOS builds may be unstable in beta. If you encounter issues,"
echo "   please use the Windows version which is more thoroughly tested."