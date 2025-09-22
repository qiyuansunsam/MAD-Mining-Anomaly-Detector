===============================================
    ANOMALY DETECTOR - WINDOWS INSTALLATION
===============================================

QUICK START:
1. Extract ALL files from the ZIP archive
2. Double-click "windows-setup.bat" for guided setup
   OR
3. Double-click "anomaly-detector.exe" to run directly

REQUIREMENTS:
- Windows 10/11 (64-bit)
- Python 3.9-3.12 (for AI detection features)

PYTHON INSTALLATION:
If you don't have Python installed:
1. Go to https://python.org/downloads/
2. Download Python 3.9, 3.10, 3.11, or 3.12
3. During installation, CHECK "Add Python to PATH"
4. Restart the application after installing Python

IMPORTANT FOR PYTHON 3.12 USERS:
Python 3.12 is supported but may require additional setup:
- Some packages need compilation from source
- The setup script will try alternative installation methods
- If installation fails, try running as Administrator

TROUBLESHOOTING:

Problem: "ES Module error" or application won't start
Solution: 
- Make sure all files are extracted from ZIP
- Try running "windows-setup.bat" as administrator
- Restart your computer after installing Python

Problem: "Python not found" error
Solution:
- Install Python from python.org
- Make sure "Add Python to PATH" was checked during installation
- Open Command Prompt and type "python --version" to verify

Problem: AI detection doesn't work
Solution:
- Open Command Prompt in the application folder
- Run: pip install -r backend\requirements.txt
- This installs the required AI packages

Problem: Application crashes on startup
Solution:
- Right-click "anomaly-detector.exe" → "Run as administrator"
- Check Windows Defender hasn't quarantined files
- Ensure no antivirus is blocking the application

MANUAL BACKEND SETUP:
If automatic setup fails, manually install Python packages:
1. Open Command Prompt in the application directory
2. Navigate to backend folder: cd backend
3. Install requirements: pip install -r requirements.txt

FEATURES:
✓ AI-powered anomaly detection
✓ Image analysis and processing
✓ Video frame extraction
✓ Real-time inference
✓ Export results

SUPPORT:
For technical support or bug reports, please provide:
- Windows version
- Python version (python --version)
- Error message screenshots
- Console output (press F12 in the app)

The application will work without Python, but AI detection 
features will be disabled.

Last updated: September 2025