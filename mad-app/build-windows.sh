#!/bin/bash

# Alternative Windows build script for environments without wine
echo "Building Anomaly Detector for Windows..."

# Build the React app
npm run build

# Create a simplified Windows package structure
mkdir -p dist/windows-portable
cp -r build/* dist/windows-portable/
cp public/electron.js dist/windows-portable/
cp package.json dist/windows-portable/

# Copy only essential backend files (excluding runs, datasets, etc.)
mkdir -p dist/windows-portable/backend
cp backend/inference_server.py dist/windows-portable/backend/
cp backend/requirements.txt dist/windows-portable/backend/
cp -r backend/models dist/windows-portable/backend/

# Create a batch file to run the application
cat > dist/windows-portable/run.bat << 'EOF'
@echo off
echo Starting Anomaly Detector...
cd /d "%~dp0"
start "Anomaly Detector" electron.exe .
EOF

# Create instructions for the user
cat > dist/windows-portable/README.txt << 'EOF'
Anomaly Detector - Windows Portable Version

To run this application on Windows:

1. Download and install Node.js from: https://nodejs.org/
2. Download and install Electron globally: npm install -g electron
3. Double-click run.bat or run "electron ." in this directory

Backend Requirements:
- Python 3.8+
- Install requirements: pip install -r backend/requirements.txt

Note: This is a portable version that requires manual setup of dependencies.
For the backend to work, you'll need to have Python and the required packages installed.
EOF

echo "Windows portable build created in dist/windows-portable/"
echo "Size of the build:"
du -sh dist/windows-portable/