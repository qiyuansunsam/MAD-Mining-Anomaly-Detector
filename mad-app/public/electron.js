const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

// Simple development detection without external dependencies
const isDev = process.env.NODE_ENV === 'development' || 
              process.defaultApp || 
              /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || 
              /[\\/]electron[\\/]/.test(process.execPath);

let mainWindow;
let pythonProcess;

function showErrorDialog(title, message) {
  if (mainWindow) {
    dialog.showErrorBox(title, message);
  } else {
    console.error(`${title}: ${message}`);
  }
}

function createWindow() {
  // Check if preload script exists
  const preloadPath = path.join(__dirname, 'preload.js');
  let webPreferences = {
    nodeIntegration: false,
    contextIsolation: true
  };
  
  // Only add preload if file exists
  try {
    require('fs').accessSync(preloadPath);
    webPreferences.preload = preloadPath;
  } catch (error) {
    console.warn('Preload script not found, continuing without it');
    // Enable nodeIntegration as fallback if no preload
    webPreferences.nodeIntegration = true;
    webPreferences.contextIsolation = false;
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences,
    // Remove icon reference if it doesn't exist
    // icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: true,
    backgroundColor: '#0f0f0f',
    show: false
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  try {
    // Determine Python backend path based on environment
    const backendPath = isDev 
      ? path.join(__dirname, '../../backend/inference_server.py')
      : path.join(process.resourcesPath, 'backend/inference_server.py');
    
    // Determine working directory for models
    const workingDir = isDev 
      ? path.join(__dirname, '../..')
      : process.resourcesPath;

    console.log('Starting Python backend:', backendPath);
    console.log('Working directory:', workingDir);

    // Check if Python backend file exists
    const fs = require('fs');
    if (!fs.existsSync(backendPath)) {
      console.warn('Python backend file not found:', backendPath);
      showErrorDialog('Backend Not Found', 'Python backend server file is missing. Some features may not work properly.');
      return;
    }

    // Try different Python commands
    const pythonCommands = ['python', 'python3', 'py'];
    let pythonCmd = pythonCommands[0];

    // Start Python backend server
    pythonProcess = spawn(pythonCmd, [backendPath], {
      cwd: workingDir,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log(`Backend stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Backend stderr: ${data}`);
    });

    pythonProcess.on('error', (error) => {
      console.error('Failed to start Python backend:', error);
      if (error.code === 'ENOENT') {
        showErrorDialog(
          'Python Not Found', 
          'Python is not installed or not found in PATH. Please install Python 3.8+ to use the AI features.\n\nThe application will continue to work but AI detection features will be unavailable.'
        );
      } else {
        showErrorDialog(
          'Backend Error', 
          `Failed to start Python backend: ${error.message}\n\nAI detection features may not work properly.`
        );
      }
    });

    pythonProcess.on('close', (code) => {
      console.log(`Python backend exited with code ${code}`);
      if (code !== 0 && code !== null) {
        console.error(`Python backend exited with error code: ${code}`);
      }
      pythonProcess = null;
    });

  } catch (error) {
    console.error('Error starting backend:', error);
  }
}

function stopBackend() {
  if (pythonProcess) {
    console.log('Stopping Python backend...');
    pythonProcess.kill();
    pythonProcess = null;
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// IPC handlers for file operations
ipcMain.handle('select-image', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('save-image', async (event, imageData) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});