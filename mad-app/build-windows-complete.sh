#!/bin/bash

echo "Building complete Windows package for Anomaly Detector..."

# Clean previous builds
rm -rf dist/

# Build React app
echo "Building React app..."
npm run build

# Create Windows package using electron-packager
echo "Creating Windows package..."
npx electron-packager . anomaly-detector --platform=win32 --arch=x64 --out=dist --overwrite

if [ ! -d "dist/anomaly-detector-win32-x64" ]; then
    echo "Error: Failed to create Windows package"
    exit 1
fi

echo "Package created successfully. Setting up backend..."

# Ensure backend directory exists in resources
BACKEND_DIR="dist/anomaly-detector-win32-x64/resources/backend"
mkdir -p "$BACKEND_DIR"
mkdir -p "$BACKEND_DIR/models"

# Copy essential backend files
echo "Copying backend files..."
cp backend/inference_server.py "$BACKEND_DIR/"
cp backend/requirements.txt "$BACKEND_DIR/"
cp backend/models/*.pt "$BACKEND_DIR/models/" 2>/dev/null || echo "Warning: No model files found"

# Remove unwanted files
echo "Cleaning up unnecessary files..."
find dist/anomaly-detector-win32-x64/ -name "datasets" -type d -exec rm -rf {} + 2>/dev/null || true
find dist/anomaly-detector-win32-x64/ -name "runs" -type d -exec rm -rf {} + 2>/dev/null || true
find dist/anomaly-detector-win32-x64/ -name "training.log" -delete 2>/dev/null || true
find dist/anomaly-detector-win32-x64/ -name "training_results.json" -delete 2>/dev/null || true
find dist/anomaly-detector-win32-x64/ -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find dist/anomaly-detector-win32-x64/ -name "*.jpg" -delete 2>/dev/null || true
find dist/anomaly-detector-win32-x64/ -name "*.jpeg" -delete 2>/dev/null || true

# Copy setup files
echo "Adding setup files..."
cp windows-setup.bat dist/anomaly-detector-win32-x64/
cp WINDOWS-README.txt dist/anomaly-detector-win32-x64/

# Update the requirements file path in setup script
sed -i 's|backend\\requirements.txt|resources\\backend\\requirements.txt|g' dist/anomaly-detector-win32-x64/windows-setup.bat

# Verify backend files are present
echo "Verifying backend setup..."
if [ -f "$BACKEND_DIR/inference_server.py" ]; then
    echo "✓ inference_server.py found"
else
    echo "✗ inference_server.py missing"
fi

if [ -f "$BACKEND_DIR/requirements.txt" ]; then
    echo "✓ requirements.txt found"
else
    echo "✗ requirements.txt missing"
fi

MODEL_COUNT=$(find "$BACKEND_DIR/models" -name "*.pt" 2>/dev/null | wc -l)
echo "✓ Found $MODEL_COUNT model files"

# Create compressed package
echo "Creating compressed package..."
cd dist
zip -r anomaly-detector-windows-complete.zip anomaly-detector-win32-x64/ > /dev/null 2>&1

echo "Build complete!"
echo "Package size:"
du -sh anomaly-detector-win32-x64/
echo "Compressed package:"
ls -lh anomaly-detector-windows-complete.zip

echo ""
echo "Package contents:"
echo "- Main executable: anomaly-detector.exe"
echo "- Backend server: resources/backend/inference_server.py"
echo "- Python requirements: resources/backend/requirements.txt"
echo "- AI models: resources/backend/models/*.pt"
echo "- Setup assistant: windows-setup.bat"
echo "- Documentation: WINDOWS-README.txt"