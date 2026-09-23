# Boots the AVD in its own window and waits until Android reports boot complete.
. "$PSScriptRoot\env.ps1"

if ((adb devices) -match "emulator-\d+\s+device") {
  Write-Host "An emulator is already running."
  exit 0
}

Start-Process -FilePath "$env:ANDROID_SDK_ROOT\emulator\emulator.exe" `
  -ArgumentList "-avd", $env:AVD_NAME, "-no-snapshot-save", "-no-boot-anim"

Write-Host "Waiting for '$env:AVD_NAME' to boot..."
adb wait-for-device
$waited = 0
while ($waited -lt 600) {
  if ("$(adb shell getprop sys.boot_completed 2>$null)".Trim() -eq "1") {
    Write-Host "Booted after ${waited}s."
    adb devices
    exit 0
  }
  Start-Sleep 5
  $waited += 5
}
Write-Error "Emulator did not finish booting within 10 minutes."
exit 1
