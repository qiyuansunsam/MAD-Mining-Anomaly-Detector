@echo off
echo =====================================================
echo     Anomaly Detector - Windows Setup Assistant
echo =====================================================
echo.
echo This script will help you set up the Anomaly Detector application.
echo.

:: Check if Python is installed
echo [1/4] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Python is not installed or not in PATH.
    echo.
    echo To use the AI detection features, please:
    echo 1. Download Python 3.9-3.12 from https://python.org/downloads/
    echo 2. During installation, check "Add Python to PATH"
    echo 3. Restart this application after installing Python
    echo.
    echo The application will still work but AI features will be disabled.
    echo.
    pause
    goto start_app
) else (
    for /f "tokens=2" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo Python %PYTHON_VERSION% found successfully!
    
    :: Check if it's a compatible version
    echo Checking Python version compatibility...
    python -c "import sys; exit(0 if (3,9) <= sys.version_info <= (3,12) else 1)" >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo WARNING: Python version may not be fully compatible.
        echo Recommended: Python 3.9 - 3.12
        echo Current: %PYTHON_VERSION%
        echo.
        echo Continuing anyway...
        echo.
    )
)

echo.
echo [2/4] Updating pip...
python -m pip install --upgrade pip --quiet
if %errorlevel% neq 0 (
    echo WARNING: Could not upgrade pip, continuing...
)

echo.
echo [3/4] Installing Python packages...
if exist "resources\backend\requirements.txt" (
    echo Installing AI detection requirements...
    echo This may take a few minutes...
    
    :: Try installing with --no-build-isolation for better compatibility
    pip install --no-build-isolation -r resources\backend\requirements.txt --quiet
    if %errorlevel% neq 0 (
        echo.
        echo First attempt failed, trying alternative installation method...
        
        :: Try installing key packages individually
        echo Installing core packages...
        pip install "numpy>=1.26.0" --quiet
        pip install "opencv-python>=4.9.0" --quiet
        pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu --quiet
        pip install "ultralytics>=8.1.0" "fastapi>=0.104.1" "uvicorn>=0.24.0" --quiet
        
        if %errorlevel% neq 0 (
            echo.
            echo WARNING: Some packages may not have installed correctly.
            echo.
            echo Manual installation may be needed:
            echo 1. Open Command Prompt as Administrator
            echo 2. Navigate to this directory
            echo 3. Run: pip install -r resources\backend\requirements.txt
            echo.
            echo The application will try to work with available packages.
            echo.
        ) else (
            echo Core packages installed successfully!
        )
    ) else (
        echo All packages installed successfully!
    )
) else (
    echo Requirements file not found. Backend may not work properly.
)

:start_app
echo.
echo [4/4] Starting Anomaly Detector...
echo.

:: Start the application
if exist "anomaly-detector.exe" (
    echo Launching application...
    start "Anomaly Detector" anomaly-detector.exe
) else (
    echo ERROR: anomaly-detector.exe not found!
    echo Please make sure you've extracted all files from the ZIP archive.
    pause
    exit /b 1
)

echo.
echo Setup complete! The application should start now.
echo.
echo TROUBLESHOOTING:
echo - If AI detection fails: Install Python 3.9-3.12
echo - If packages fail to install: Run as Administrator
echo - If app won't start: Check Windows Defender/Antivirus
echo - For Python 3.12: Some packages may need manual compilation
echo.
echo Press any key to close this window...
pause >nul