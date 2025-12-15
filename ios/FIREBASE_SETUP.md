# iOS Firebase Setup Guide

## Required: GoogleService-Info.plist

To enable Firebase on iOS, you need to add the `GoogleService-Info.plist` file.

### Steps:

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `bdg-appstation`
3. **Add iOS App** (if not already added):
   - Click the iOS icon or "Add app"
   - Bundle ID: `com.bdgguard`
   - App nickname: `bdg iOS`
   - App Store ID: (optional)
4. **Download GoogleService-Info.plist**
5. **Add to Xcode project**:
   - Drag and drop `GoogleService-Info.plist` into `ios/bdg/` folder in Xcode
   - Make sure "Copy items if needed" is checked
   - Make sure "bdg" target is selected
   - Click "Finish"

### Alternative (Manual):
- Copy the downloaded `GoogleService-Info.plist` to: `ios/bdg/GoogleService-Info.plist`
- Make sure it's added to the Xcode project target

## Verification

After adding the file, verify:
1. File exists at: `ios/bdg/GoogleService-Info.plist`
2. File is included in Xcode project (check in Xcode)
3. AppDelegate.mm has Firebase import and initialization (already done)
4. Run `cd ios && pod install` to ensure Firebase pods are installed

## Current Status

✅ Firebase import added to AppDelegate.mm
✅ Firebase initialization code added
⏳ GoogleService-Info.plist needs to be downloaded and added
