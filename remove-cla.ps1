# Run this script to remove the legacy "cla" folder.
# Close any IDE/terminal using files in cla before running.
# Usage: .\remove-cla.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$claPath = Join-Path $root "cla"

if (-not (Test-Path $claPath)) {
    Write-Host "Folder 'cla' does not exist. Nothing to remove."
    exit 0
}

Write-Host "Removing 'cla' folder..."
Remove-Item -Path $claPath -Recurse -Force
Write-Host "Done. 'cla' folder removed."
