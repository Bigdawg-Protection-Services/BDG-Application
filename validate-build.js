#!/usr/bin/env node
/**
 * Pre-build validation script for iOS EAS Build
 * Run this before uploading to catch issues early
 */

const fs = require('fs');
const path = require('path');

let errors = [];
let warnings = [];

console.log('🔍 Validating iOS build configuration...\n');

// 1. Validate eas.json
console.log('1. Checking eas.json...');
try {
  const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
  
  // Check for invalid node version format
  if (easJson.build?.production?.node) {
    const nodeVersion = easJson.build.production.node;
    if (nodeVersion.includes('x') || !/^\d+\.\d+\.\d+$/.test(nodeVersion)) {
      errors.push('eas.json: Invalid node version format. Use specific version like "18.17.0" or remove it.');
    }
  }
  
  // Check for invalid "auto" values in submit
  if (easJson.submit?.production?.ios) {
    const submit = easJson.submit.production.ios;
    if (submit.appleId === 'auto' || submit.ascAppId === 'auto' || submit.appleTeamId === 'auto') {
      errors.push('eas.json: Remove "auto" values from submit.ios config. Use actual values or remove the section.');
    }
  }
  
  console.log('   ✅ eas.json is valid');
} catch (e) {
  errors.push(`eas.json: ${e.message}`);
}

// 2. Validate package.json
console.log('2. Checking package.json...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check for required CLI packages
  const requiredPackages = [
    '@react-native-community/cli',
    '@react-native-community/cli-platform-ios',
    '@react-native-community/cli-server-api'
  ];
  
  const allDeps = {
    ...packageJson.dependencies || {},
    ...packageJson.devDependencies || {}
  };
  
  requiredPackages.forEach(pkg => {
    if (!allDeps[pkg]) {
      errors.push(`package.json: Missing required package: ${pkg}`);
    }
  });
  
  // Check React Native version compatibility
  if (packageJson.dependencies['react-native'] === '0.76.0') {
    const cliVersion = allDeps['@react-native-community/cli'];
    if (!cliVersion || !cliVersion.includes('15.0.0')) {
      warnings.push('package.json: React Native 0.76.0 should use @react-native-community/cli 15.0.0');
    }
  }
  
  console.log('   ✅ package.json is valid');
} catch (e) {
  errors.push(`package.json: ${e.message}`);
}

// 3. Validate app.json
console.log('3. Checking app.json...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  
  if (!appJson.ios?.bundleIdentifier) {
    errors.push('app.json: Missing ios.bundleIdentifier');
  }
  
  if (appJson.ios?.bundleIdentifier !== 'com.bdgguard') {
    warnings.push('app.json: Bundle identifier should be com.bdgguard for consistency');
  }
  
  console.log('   ✅ app.json is valid');
} catch (e) {
  errors.push(`app.json: ${e.message}`);
}

// 4. Validate Podfile syntax
console.log('4. Checking Podfile...');
try {
  const podfile = fs.readFileSync('ios/Podfile', 'utf8');
  
  // Check for modular headers
  if (!podfile.includes(':modular_headers => true')) {
    warnings.push('Podfile: Firebase pods should have modular_headers enabled');
  }
  
  // Check for use_native_modules!
  if (!podfile.includes('use_native_modules!')) {
    errors.push('Podfile: Missing use_native_modules! call');
  }
  
  console.log('   ✅ Podfile structure is valid');
} catch (e) {
  errors.push(`Podfile: ${e.message}`);
}

// 5. Validate Xcode project file
console.log('5. Checking Xcode project file...');
try {
  const projectPbx = fs.readFileSync('ios/bdg.xcodeproj/project.pbxproj', 'utf8');
  
  // Check for GoogleService-Info.plist reference
  if (!projectPbx.includes('GoogleService-Info.plist')) {
    errors.push('Xcode project: GoogleService-Info.plist not found in project.pbxproj');
  }
  
  // Check for UUID consistency
  const uuidMatches = projectPbx.match(/13B07FB91A68108700A75B9A/g);
  if (!uuidMatches || uuidMatches.length < 2) {
    errors.push('Xcode project: GoogleService-Info.plist UUID reference is incomplete');
  }
  
  console.log('   ✅ Xcode project file is valid');
} catch (e) {
  errors.push(`Xcode project: ${e.message}`);
}

// 6. Check critical files exist
console.log('6. Checking critical files...');
const criticalFiles = [
  'ios/bdg/GoogleService-Info.plist',
  'ios/bdg/Info.plist',
  'ios/bdg/AppDelegate.mm',
  'ios/Podfile',
  'package.json',
  'eas.json',
  'app.json'
];

criticalFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    errors.push(`Missing critical file: ${file}`);
  }
});

console.log('   ✅ All critical files exist');

// 7. Validate GoogleService-Info.plist
console.log('7. Checking GoogleService-Info.plist...');
try {
  const plist = fs.readFileSync('ios/bdg/GoogleService-Info.plist', 'utf8');
  
  if (!plist.includes('com.bdgguard')) {
    errors.push('GoogleService-Info.plist: Bundle ID should be com.bdgguard');
  }
  
  if (!plist.includes('BUNDLE_ID')) {
    warnings.push('GoogleService-Info.plist: Missing BUNDLE_ID key');
  }
  
  console.log('   ✅ GoogleService-Info.plist is valid');
} catch (e) {
  errors.push(`GoogleService-Info.plist: ${e.message}`);
}

// 8. Check AppDelegate for Firebase
console.log('8. Checking AppDelegate.mm...');
try {
  const appDelegate = fs.readFileSync('ios/bdg/AppDelegate.mm', 'utf8');
  
  if (!appDelegate.includes('#import <Firebase.h>')) {
    errors.push('AppDelegate.mm: Missing Firebase import');
  }
  
  if (!appDelegate.includes('[FIRApp configure]')) {
    errors.push('AppDelegate.mm: Missing Firebase initialization');
  }
  
  console.log('   ✅ AppDelegate.mm is valid');
} catch (e) {
  errors.push(`AppDelegate.mm: ${e.message}`);
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(50));

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed! Build should succeed.\n');
  process.exit(0);
}

if (errors.length > 0) {
  console.log(`\n❌ ERRORS (${errors.length}):`);
  errors.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`);
  });
  console.log('\n⚠️  Fix these errors before building!\n');
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach((warning, i) => {
    console.log(`   ${i + 1}. ${warning}`);
  });
  console.log('\n💡 These warnings may not block the build but should be reviewed.\n');
}

process.exit(errors.length > 0 ? 1 : 0);
