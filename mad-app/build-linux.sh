#!/bin/bash
# Build script for Linux distributions

set -e

echo "🐧 Building Anomaly Detector for Linux..."

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

# Build Linux distributions
echo "🏗️ Building Linux distributions..."

# Build AppImage
echo "📱 Building AppImage..."
npm run dist:linux:appimage

# Build DEB package
echo "📦 Building DEB package..."
npm run dist:linux:deb

# Build TAR.GZ archive
echo "🗜️ Building TAR.GZ archive..."
npm run dist:linux

echo "✅ Linux builds completed!"
echo "📁 Check the 'dist' folder for your Linux distributions:"
ls -la dist/ | grep -E "\.(AppImage|deb|tar\.gz)$" || echo "No Linux builds found in dist/"

echo ""
echo "🚀 Linux build artifacts:"
echo "  - AppImage: Portable application for all Linux distributions"
echo "  - DEB: Package for Debian/Ubuntu systems"  
echo "  - TAR.GZ: Archive for manual installation"