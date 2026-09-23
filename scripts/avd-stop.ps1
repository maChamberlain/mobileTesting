# Shuts down every running emulator cleanly.
. "$PSScriptRoot\env.ps1"

$emulators = (adb devices) | Select-String -Pattern "^(emulator-\d+)\s" | ForEach-Object { $_.Matches[0].Groups[1].Value }
if (-not $emulators) {
  Write-Host "No emulator running."
  exit 0
}
foreach ($e in $emulators) {
  adb -s $e emu kill | Out-Null
  Write-Host "Stopped $e"
}
