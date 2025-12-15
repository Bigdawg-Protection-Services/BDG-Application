# Pre-Build Validation Checklist

Run this checklist before uploading to EAS Build to catch issues early.

## Quick Validation Command

```powershell
node validate-build.js
```

## Manual Checklist

### ✅ Configuration Files

- [ ] **eas.json** - Valid JSON, no invalid "auto" values, no invalid node version
- [ ] **app.json** - Valid JSON, bundleIdentifier is `com.bdgguard`
- [ ] **package.json** - Valid JSON, all required packages present

### ✅ iOS Files

- [ ] **ios/Podfile** - Contains `use_native_modules!`, Firebase modular headers configured
- [ ] **ios/bdg.xcodeproj/project.pbxproj** - GoogleService-Info.plist UUID references are complete
- [ ] **ios/bdg/GoogleService-Info.plist** - Exists and contains `com.bdgguard` bundle ID
- [ ] **ios/bdg/AppDelegate.mm** - Contains Firebase import and initialization
- [ ] **ios/bdg/Info.plist** - All required permissions present

### ✅ Dependencies

- [ ] **@react-native-community/cli** - Version 15.0.0-alpha.2 (or compatible)
- [ ] **@react-native-community/cli-platform-ios** - Present in devDependencies
- [ ] **@react-native-community/cli-server-api** - Present in devDependencies
- [ ] **@react-native-firebase/app** - Present in dependencies
- [ ] **@react-native-firebase/storage** - Present in dependencies

### ✅ Firebase Configuration

- [ ] **GoogleService-Info.plist** - Exists in `ios/bdg/` directory
- [ ] **GoogleService-Info.plist** - Added to Xcode project (UUID references exist)
- [ ] **AppDelegate.mm** - Firebase imported and initialized
- [ ] **Podfile** - Firebase pods have modular headers enabled

### ✅ Common Issues to Avoid

- [ ] No "auto" values in eas.json submit config
- [ ] No invalid node version format (like "18.x")
- [ ] All UUID references in project.pbxproj are complete
- [ ] Bundle identifier is consistent (`com.bdgguard`)
- [ ] All critical files exist and are readable

## If Validation Fails

1. **Fix all ERRORS** - These will block the build
2. **Review WARNINGS** - These may cause issues but won't block
3. **Re-run validation** - `node validate-build.js`
4. **Only build when validation passes** - This saves upload time

## Build Command (After Validation Passes)

```powershell
eas build --platform ios --profile production --clear-cache
```
