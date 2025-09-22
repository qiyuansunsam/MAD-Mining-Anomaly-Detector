#!/bin/bash
# Build script for all platforms

set -e

echo "🌍 Building Anomaly Detector for all platforms..."

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

# Build for all platforms
echo "🏗️ Building for all platforms..."

echo "🪟 Building for Windows..."
npm run dist:win

echo "🐧 Building for Linux..."
npm run dist:linux

echo "🍎 Building for macOS..."
npm run dist:mac

echo "✅ All platform builds completed!"
echo "📁 Check the 'dist' folder for distributions:"
ls -la dist/ || echo "No builds found in dist/"

echo ""
echo "🚀 Build artifacts by platform:"
echo "  Windows: ZIP archives (most stable)"
echo "  Linux: AppImage, DEB, TAR.GZ (beta - may be unstable)"
echo "  macOS: DMG, ZIP (beta - may be unstable)"
echo ""
echo "⚠️  Linux and macOS versions are in beta and may be unstable."
echo "   If you encounter issues, please use the Windows version."