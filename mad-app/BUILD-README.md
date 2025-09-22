# Cross-Platform Build Instructions

## Fixed Issues ✅

1. **Missing Author Information** - Added author field to package.json (required for Linux .deb packages)
2. **Linux Maintainer** - Added maintainer information for Linux builds
3. **Platform Dependencies** - Configured builds to work without platform-specific dependencies
4. **Build Targets** - Updated targets for better cross-platform compatibility

## Build Scripts Available

### Individual Platform Builds
```bash
# Linux (works on Linux systems)
./build-linux.sh
npm run dist:linux
npm run dist:linux:appimage  # Recommended for Linux

# macOS (requires macOS system)
./build-macos.sh
npm run dist:mac

# Windows (requires Windows or wine on Linux)
npm run dist:win:portable    # Portable executable
```

### Comprehensive Build
```bash
# Build all platforms with error handling
./build-cross-platform.sh
```

## Platform-Specific Notes

### 🪟 Windows Builds
- **Best built on**: Windows systems
- **Cross-compile**: Possible but requires wine on Linux
- **Targets**: Portable exe, ZIP archive
- **Status**: Most stable

### 🐧 Linux Builds  
- **Best built on**: Linux systems
- **Cross-compile**: Not recommended
- **Targets**: AppImage (recommended), DEB, TAR.GZ
- **Status**: Beta - may be unstable

### 🍎 macOS Builds
- **Best built on**: macOS systems only
- **Cross-compile**: Not possible
- **Targets**: ZIP archive (DMG requires additional setup)
- **Status**: Beta - may be unstable

## Build Outputs

After successful builds, check the `dist/` folder for:

### Windows
- `Anomaly Detector-1.0.0-win.exe` (portable)
- `Anomaly Detector-1.0.0-win.zip` (archive)

### Linux
- `Anomaly Detector-1.0.0-linux-x86_64.AppImage` (recommended)
- `Anomaly Detector-1.0.0-linux-x64.deb`
- `Anomaly Detector-1.0.0-linux-x64.tar.gz`

### macOS
- `Anomaly Detector-1.0.0-mac-x64.zip`
- `Anomaly Detector-1.0.0-mac-arm64.zip`

## GitHub Release Upload

1. Create a new release on GitHub
2. Upload the built files with these naming conventions:
   - `Anomaly-Detector-1.0.0-win.zip`
   - `Anomaly-Detector-1.0.0-linux-x64.AppImage`
   - `Anomaly-Detector-1.0.0-mac-x64.zip`

3. The website will automatically link to these files

## Requirements Files

Platform-specific Python requirements are available:
- `requirements.txt` - Cross-platform (default)
- `requirements-windows.txt` - Windows-specific
- `requirements-linux.txt` - Linux-specific  
- `requirements-macos.txt` - macOS-specific

## Troubleshooting

### Common Issues

1. **"wine is required"** - You're trying to build Windows on Linux without wine
   - Solution: Use `npm run dist:linux` instead for Linux builds

2. **"Cannot find module 'dmg-license'"** - macOS-specific dependency missing
   - Solution: Only build macOS on macOS systems

3. **"Please specify author 'email'"** - Missing author in package.json
   - Solution: Already fixed in current package.json

4. **Build fails with permission errors**
   - Solution: Make sure build scripts are executable: `chmod +x *.sh`

### Build Recommendations

1. **For stable releases**: Build on native platforms
   - Windows builds → Windows system
   - Linux builds → Linux system  
   - macOS builds → macOS system

2. **For testing**: Use the cross-platform script on Linux
   - Windows portable builds work cross-platform
   - Linux AppImage builds work on Linux
   - macOS builds require macOS

## Website Integration

The website (`/implementation` page) now shows:
- ✅ Multi-platform download options
- ✅ Stability warnings for beta versions
- ✅ GitHub releases integration
- ✅ Platform-specific instructions