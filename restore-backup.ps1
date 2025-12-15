# PowerShell script to restore from backup
# This will help you get back to the working state

Write-Host "🔄 Restore from Backup" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

Write-Host "Available backup options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Switch to backup branch (backup-working-state)"
Write-Host "2. Reset current branch to backup tag (v-working-backup)"
Write-Host "3. Create new branch from backup tag"
Write-Host "4. Show backup information"
Write-Host ""
$choice = Read-Host "Select option (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🔄 Switching to backup branch..." -ForegroundColor Cyan
        git checkout backup-working-state
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Switched to backup-working-state branch" -ForegroundColor Green
            Write-Host "Current branch: " -NoNewline
            git branch --show-current
        } else {
            Write-Host "❌ Error: Backup branch not found!" -ForegroundColor Red
        }
    }
    "2" {
        Write-Host ""
        Write-Host "⚠️  WARNING: This will reset your current branch!" -ForegroundColor Yellow
        $confirm = Read-Host "Are you sure? This will lose uncommitted changes! (yes/no)"
        if ($confirm -eq "yes") {
            Write-Host "🔄 Resetting to backup tag..." -ForegroundColor Cyan
            git reset --hard v-working-backup
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Reset to v-working-backup tag" -ForegroundColor Green
            } else {
                Write-Host "❌ Error: Backup tag not found!" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Restore cancelled" -ForegroundColor Red
        }
    }
    "3" {
        $branchName = Read-Host "Enter name for new branch"
        if ($branchName) {
            Write-Host "🔄 Creating new branch from backup..." -ForegroundColor Cyan
            git checkout -b $branchName v-working-backup
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Created branch '$branchName' from backup" -ForegroundColor Green
            } else {
                Write-Host "❌ Error: Backup tag not found!" -ForegroundColor Red
            }
        }
    }
    "4" {
        Write-Host ""
        Write-Host "📋 Backup Information:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Backup branches:" -ForegroundColor Cyan
        git branch | Select-String "backup"
        Write-Host ""
        Write-Host "Backup tags:" -ForegroundColor Cyan
        git tag -l "v-*"
        Write-Host ""
        Write-Host "Current branch: " -NoNewline
        git branch --show-current
        Write-Host ""
        Write-Host "Current commit: " -NoNewline
        git log --oneline -1
    }
    default {
        Write-Host "❌ Invalid option" -ForegroundColor Red
    }
}

Write-Host ""
