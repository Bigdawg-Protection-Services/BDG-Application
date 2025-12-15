# Build Troubleshooting Guide

## ⚠️ DO NOT Replace iOS Folder

**Replacing the iOS folder with a fresh copy will:**
- ❌ Remove GoogleService-Info.plist from Xcode project
- ❌ Remove Firebase modular headers configuration
- ❌ Remove Firebase initialization from AppDelegate.mm
- ❌ Revert bundle identifier fixes
- ❌ Cause the build to fail again

## ✅ If Build Fails - Follow This Process

### Step 1: Check Build Logs

1. Go to the EAS Build URL provided in the error
2. Look for the **exact error message** in the logs
3. Identify which phase failed:
   - `npm install` - Dependency issue
   - `pod install` - CocoaPods issue
   - `xcodebuild` - Xcode compilation issue
   - `archive` - Code signing/archive issue

### Step 2: Common Failures & Fixes

#### Failure: "Cannot find module @react-native-community/cli"
**Fix:** Already fixed - CLI is now in dependencies
**Verify:** Run `npm run validate-build` - should pass

#### Failure: "Firebase Swift pods cannot be integrated"
**Fix:** Already fixed - Modular headers configured in Podfile
**Verify:** Check `ios/Podfile` has `:modular_headers => true`

#### Failure: "GoogleService-Info.plist not found"
**Fix:** Already fixed - File added to Xcode project
**Verify:** Check `ios/bdg.xcodeproj/project.pbxproj` contains UUID references

#### Failure: "Invalid bundle identifier"
**Fix:** Already fixed - All configs use `com.bdgguard`
**Verify:** Run `npm run validate-build`

#### Failure: "Code signing error"
**Fix:** Configure Apple credentials
```powershell
eas credentials
```

### Step 3: Targeted Fixes (Don't Replace Everything)

If a specific file is corrupted:

1. **Backup current iOS folder:**
   ```powershell
   # Create backup
   Copy-Item -Path "ios" -Destination "ios.backup" -Recurse
   ```

2. **Fix only the problematic file:**
   - Don't replace the entire iOS folder
   - Only restore/update the specific file that's causing issues

3. **Re-validate:**
   ```powershell
   npm run validate-build
   ```

### Step 4: If You Must Restore iOS Folder

**ONLY if absolutely necessary** (e.g., Xcode project file is completely corrupted):

1. **Backup current fixes:**
   ```powershell
   # Save our fixes
   Copy-Item "ios/Podfile" "Podfile.backup"
   Copy-Item "ios/bdg/AppDelegate.mm" "AppDelegate.mm.backup"
   Copy-Item "ios/bdg/GoogleService-Info.plist" "GoogleService-Info.plist.backup"
   ```

2. **Restore iOS folder from repo**

3. **Re-apply fixes:**
   - Restore Podfile (Firebase modular headers)
   - Restore AppDelegate.mm (Firebase initialization)
   - Add GoogleService-Info.plist to Xcode project
   - Update bundle identifiers

4. **Re-validate:**
   ```powershell
   npm run validate-build
   ```

## 🔍 Pre-Build Validation

**ALWAYS run before building:**
```powershell
npm run validate-build
```

This catches 90% of issues before upload.

## 📋 Current Fixes Applied (Don't Lose These!)

1. ✅ **Podfile** - Firebase modular headers enabled
2. ✅ **AppDelegate.mm** - Firebase import and initialization
3. ✅ **project.pbxproj** - GoogleService-Info.plist added
4. ✅ **package.json** - CLI packages in dependencies
5. ✅ **eas.json** - Valid configuration
6. ✅ **app.json** - Bundle identifier `com.bdgguard`

## 🎯 Best Practice

**Before every build:**
1. Run `npm run validate-build` (2 seconds)
2. If validation passes → Build
3. If validation fails → Fix errors first

**If build fails:**
1. Check EAS Build logs for specific error
2. Fix only the specific issue
3. Re-validate
4. Re-build

**Never:**
- ❌ Replace entire iOS folder without backing up fixes
- ❌ Build without validation
- ❌ Ignore validation errors
