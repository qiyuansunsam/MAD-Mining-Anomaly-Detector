#!/bin/bash
# Comprehensive cross-platform build script for Anomaly Detector

set -e

echo "🌍 Building Anomaly Detector for all platforms..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Platform detection
PLATFORM=$(uname -s)
echo -e "${BLUE}🔍 Detected platform: $PLATFORM${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Node.js version: $(node --version)${NC}"
echo -e "${BLUE}📋 npm version: $(npm --version)${NC}"

# Clean previous builds
echo -e "${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf dist/
rm -rf build/

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

# Install platform-specific dependencies
if [[ "$PLATFORM" == "Darwin" ]]; then
    echo -e "${BLUE}🍎 Installing macOS-specific dependencies...${NC}"
    npm install dmg-license@^1.0.11 --save-dev --no-save
fi

# Build React app
echo -e "${BLUE}⚛️ Building React application...${NC}"
npm run build

# Build for different platforms based on what's available
echo -e "${BLUE}🏗️ Starting platform builds...${NC}"

# Windows build (using working complete method)
echo -e "${GREEN}🪟 Building for Windows...${NC}"
if ./build-windows-complete.sh; then
    echo -e "${GREEN}✅ Windows build completed successfully${NC}"
else
    echo -e "${RED}❌ Windows build failed${NC}"
fi

# Linux build (works best on Linux, but can work on other platforms)
echo -e "${GREEN}🐧 Building for Linux...${NC}"
if npm run dist:linux; then
    echo -e "${GREEN}✅ Linux build completed successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Linux build failed - this may be due to platform limitations${NC}"
fi

# macOS build skipped - not supported in this release
echo -e "${YELLOW}⚠️ Skipping macOS build - not supported in this release${NC}"

# Show results
echo -e "${GREEN}🎉 Build process completed!${NC}"
echo -e "${BLUE}📁 Build artifacts in 'dist/' folder:${NC}"

if [ -d "dist" ]; then
    ls -la dist/ | grep -v "^d" | tail -n +2 || echo "No build files found"
    
    echo ""
    echo -e "${BLUE}📊 Build summary:${NC}"
    echo -e "${GREEN}🪟 Windows builds:${NC}"
    ls dist/ 2>/dev/null | grep -i "win" || echo "  None"
    
    echo -e "${GREEN}🐧 Linux builds:${NC}"
    ls dist/ 2>/dev/null | grep -i "linux" || echo "  None"
else
    echo -e "${RED}No dist folder found${NC}"
fi

echo ""
echo -e "${BLUE}📋 Build Notes:${NC}"
echo -e "${YELLOW}• Windows builds are the most stable and recommended${NC}"
echo -e "${YELLOW}• Linux builds work best on Linux systems (beta)${NC}"
echo -e "${YELLOW}• Upload the generated files to GitHub releases manually${NC}"
echo -e "${YELLOW}• Supported formats:${NC}"
echo -e "${YELLOW}  - Windows: Complete package (recommended)${NC}"
echo -e "${YELLOW}  - Linux: AppImage, DEB, TAR.GZ${NC}"

echo ""
echo -e "${GREEN}✅ Cross-platform build script completed!${NC}"