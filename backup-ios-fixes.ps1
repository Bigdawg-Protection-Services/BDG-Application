# PowerShell script to backup iOS fixes before any restore operation
# Run this BEFORE replacing iOS folder

Write-Host "📦 Backing up iOS fixes..." -ForegroundColor Cyan

$backupDir = "ios-fixes-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $backupDir | Out-Null

# Backup critical files with our fixes
Copy-Item "ios/Podfile" "$backupDir/Podfile" -Force
Copy-Item "ios/bdg/AppDelegate.mm" "$backupDir/AppDelegate.mm" -Force
Copy-Item "ios/bdg/GoogleService-Info.plist" "$backupDir/GoogleService-Info.plist" -Force
Copy-Item "ios/bdg/Info.plist" "$backupDir/Info.plist" -Force
Copy-Item "ios/bdg.xcodeproj/project.pbxproj" "$backupDir/project.pbxproj" -Force

Write-Host "✅ Backup created in: $backupDir" -ForegroundColor Green
Write-Host ""
Write-Host "Files backed up:" -ForegroundColor Yellow
Write-Host "  - Podfile (Firebase modular headers)"
Write-Host "  - AppDelegate.mm (Firebase initialization)"
Write-Host "  - GoogleService-Info.plist (Firebase config)"
Write-Host "  - Info.plist (Permissions)"
Write-Host "  - project.pbxproj (Xcode project file)"
Write-Host ""
Write-Host "⚠️  If you restore iOS folder, you MUST re-apply these fixes!" -ForegroundColor Red
