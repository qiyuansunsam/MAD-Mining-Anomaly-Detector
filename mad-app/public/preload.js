const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  selectImage: () => ipcRenderer.invoke('select-image'),
  saveImage: (imageData) => ipcRenderer.invoke('save-image', imageData),
  
  // Additional APIs for the renderer process
  platform: process.platform,
  
  // File system operations
  openFile: (options) => ipcRenderer.invoke('open-file', options),
  saveFile: (data, options) => ipcRenderer.invoke('save-file', data, options),
  
  // Backend communication
  sendBackendRequest: (data) => ipcRenderer.invoke('backend-request', data),
  
  // System info
  getSystemInfo: () => ipcRenderer.invoke('get-system-info')
});

// Remove this if you want to leave the Chrome DevTools.
window.addEventListener('DOMContentLoaded', () => {
  console.log('Preload script loaded successfully');
});