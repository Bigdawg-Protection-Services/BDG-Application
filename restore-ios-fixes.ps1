# PowerShell script to restore iOS fixes after replacing iOS folder
# Run this AFTER replacing iOS folder from repo

param(
    [Parameter(Mandatory=$true)]
    [string]$BackupDir
)

if (-not (Test-Path $BackupDir)) {
    Write-Host "❌ Backup directory not found: $BackupDir" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Restoring iOS fixes from backup..." -ForegroundColor Cyan

# Restore critical files
if (Test-Path "$BackupDir/Podfile") {
    Copy-Item "$BackupDir/Podfile" "ios/Podfile" -Force
    Write-Host "✅ Restored Podfile" -ForegroundColor Green
}

if (Test-Path "$BackupDir/AppDelegate.mm") {
    Copy-Item "$BackupDir/AppDelegate.mm" "ios/bdg/AppDelegate.mm" -Force
    Write-Host "✅ Restored AppDelegate.mm" -ForegroundColor Green
}

if (Test-Path "$BackupDir/GoogleService-Info.plist") {
    Copy-Item "$BackupDir/GoogleService-Info.plist" "ios/bdg/GoogleService-Info.plist" -Force
    Write-Host "✅ Restored GoogleService-Info.plist" -ForegroundColor Green
}

if (Test-Path "$BackupDir/Info.plist") {
    Copy-Item "$BackupDir/Info.plist" "ios/bdg/Info.plist" -Force
    Write-Host "✅ Restored Info.plist" -ForegroundColor Green
}

if (Test-Path "$BackupDir/project.pbxproj") {
    Copy-Item "$BackupDir/project.pbxproj" "ios/bdg.xcodeproj/project.pbxproj" -Force
    Write-Host "✅ Restored project.pbxproj" -ForegroundColor Green
}

Write-Host ""
Write-Host "⚠️  IMPORTANT: GoogleService-Info.plist UUID references may need to be re-added to project.pbxproj" -ForegroundColor Yellow
Write-Host "   Run: npm run validate-build to verify" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Restoration complete!" -ForegroundColor Green
