# PowerShell script to create safe backup before UI redesign
# This script will:
# 1. Commit current working state
# 2. Create backup branch
# 3. Create backup tag
# 4. Create UI redesign branch

Write-Host "🔒 Creating Safe Backup Before UI Redesign..." -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Show current status
Write-Host "📊 Current Status:" -ForegroundColor Yellow
git status --short
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to commit current changes and create backup? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Backup cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📦 Step 1: Committing current working state..." -ForegroundColor Cyan
git add .
$commitMessage = "Backup: Working state before UI redesign - iOS only - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: Commit may have failed or nothing to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🌿 Step 2: Creating backup branch..." -ForegroundColor Cyan
git branch backup-working-state
Write-Host "✅ Backup branch created: backup-working-state" -ForegroundColor Green

Write-Host ""
Write-Host "🏷️  Step 3: Creating backup tag..." -ForegroundColor Cyan
git tag -a v-working-backup -m "Working state backup before UI redesign - $(Get-Date -Format 'yyyy-MM-dd')"
Write-Host "✅ Backup tag created: v-working-backup" -ForegroundColor Green

Write-Host ""
Write-Host "🎨 Step 4: Creating UI redesign branch..." -ForegroundColor Cyan
git checkout -b ui-redesign-ios
Write-Host "✅ UI redesign branch created: ui-redesign-ios" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Verification:" -ForegroundColor Yellow
Write-Host "Current branch: " -NoNewline
git branch --show-current
Write-Host ""
Write-Host "Backup branches:" -ForegroundColor Cyan
git branch | Select-String "backup"
Write-Host ""
Write-Host "Backup tags:" -ForegroundColor Cyan
git tag -l "v-*"

Write-Host ""
Write-Host "✅ Backup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Summary:" -ForegroundColor Yellow
Write-Host "  • Working state committed to: backup-working-state branch"
Write-Host "  • Backup tag created: v-working-backup"
Write-Host "  • You're now on: ui-redesign-ios branch"
Write-Host ""
Write-Host "🔄 To go back to working state:" -ForegroundColor Cyan
Write-Host "   git checkout backup-working-state"
Write-Host ""
Write-Host "🚀 Ready to start UI redesign!" -ForegroundColor Green
