# Mobile App Local Testing Guide

## Prerequisites

### 1. Install Required Software

#### Node.js (if not already installed)
- Download from: https://nodejs.org/ (Version 18 or higher)
- Verify installation: `node --version`

#### Android Studio
- Download from: https://developer.android.com/studio
- Install Android SDK, Android SDK Platform, and Android Virtual Device (AVD)
- Set up an Android Emulator (Pixel 5 or similar)

#### Java Development Kit (JDK)
- Android Studio usually includes this, but you may need JDK 17

### 2. Environment Setup

#### Set Android Environment Variables (if needed)
Add to your system environment variables:
- `ANDROID_HOME` = `C:\Users\YourUsername\AppData\Local\Android\Sdk`
- Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools`

## Testing Steps

### Step 1: Navigate to Mobile App Directory
```powershell
cd C:\Users\koshi\Downloads\appcentre\bdg-mobile-app-main\bdg-mobile-app-main
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Start Metro Bundler
Open a NEW PowerShell window and run:
```powershell
cd C:\Users\koshi\Downloads\appcentre\bdg-mobile-app-main\bdg-mobile-app-main
npm start
```
Keep this window open - Metro bundler needs to keep running.

### Step 4: Start Android Emulator
- Open Android Studio
- Go to Tools > Device Manager
- Start your Android Virtual Device (AVD)
- Wait for emulator to fully boot

### Step 5: Run the App
In a NEW PowerShell window (while Metro is running):
```powershell
cd C:\Users\koshi\Downloads\appcentre\bdg-mobile-app-main\bdg-mobile-app-main
npm run android
```

## Testing the Image Upload Fix

1. **Login to the app** with guard credentials
2. **Navigate to Create Report** screen
3. **Add an image** using "Add Image" button
4. **Verify**:
   - Image uploads successfully
   - Success message shows "Image uploaded"
   - If error occurs, message shows "Image upload failed" (not "Image uploaded")
   - Image appears in attachments list
5. **Submit the report** and verify it appears in admin webapp

## Troubleshooting

### Metro Bundler Issues
- Clear cache: `npm start -- --reset-cache`
- Kill port 8081: `npx react-native start --reset-cache`

### Android Build Issues
- Clean build: `cd android && ./gradlew clean && cd ..`
- Rebuild: `npm run android`

### Connection Issues
- Make sure backend is running on Heroku (it should be)
- Check Environment.js has correct URL
- Verify emulator can access internet

### Common Errors
- **"SDK location not found"**: Set ANDROID_HOME environment variable
- **"Command not found"**: Make sure Android SDK tools are in PATH
- **"Unable to load script"**: Clear Metro cache and restart

## Quick Test Commands

```powershell
# Full clean start
cd C:\Users\koshi\Downloads\appcentre\bdg-mobile-app-main\bdg-mobile-app-main
npm install
npm start -- --reset-cache
# In another window:
npm run android
```

## What Was Fixed

1. ✅ Removed Content-Type header (was breaking FormData uploads)
2. ✅ Fixed MIME type detection (now uses proper image/jpeg, image/png, etc.)
3. ✅ Fixed error message (now shows "Image upload failed" on error)
4. ✅ Fixed array mutation bug (properly removes items from array)
