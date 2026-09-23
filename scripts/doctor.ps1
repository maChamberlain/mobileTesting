# Checks every prerequisite of the test setup and prints PASS/FAIL for each.
. "$PSScriptRoot\env.ps1"

$failed = 0
function Check($name, [scriptblock]$test, $hint) {
  $ok = $false
  try { $ok = [bool](& $test) } catch {}
  if ($ok) { Write-Host "[PASS] $name" -ForegroundColor Green }
  else { Write-Host "[FAIL] $name  ->  $hint" -ForegroundColor Red; $script:failed++ }
}

Check "Virtualization enabled in firmware" {
  systeminfo | Select-String "Virtualization Enabled In Firmware: Yes"
} "Enable SVM Mode in the BIOS"

Check "AEHD hypervisor driver running" {
  (sc.exe query aehd) -match "RUNNING"
} "Run F:\Android\Sdk\extras\google\Android_Emulator_Hypervisor_Driver\silent_install.bat (admin)"

Check "Java (JAVA_HOME=$env:JAVA_HOME)" { Test-Path "$env:JAVA_HOME\bin\java.exe" } "Extract JDK 21 to F:\Android\jdk-21"
Check "adb" { Test-Path "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" } "sdkmanager platform-tools"
Check "emulator" { Test-Path "$env:ANDROID_SDK_ROOT\emulator\emulator.exe" } "sdkmanager emulator"
Check "AVD '$env:AVD_NAME' exists" { (emulator -list-avds) -contains $env:AVD_NAME } "npm run avd:create"

Check "Appium 3.x" { (npx appium --version 2>$null) -match "^3\." } "npm install"
Check "uiautomator2 driver installed" {
  Test-Path "$env:APPIUM_HOME\node_modules\appium-uiautomator2-driver"
} "npx appium driver install uiautomator2"

Check "Nothing written to C:\Users\$env:USERNAME\.android\avd" {
  -not (Get-ChildItem "$env:USERPROFILE\.android\avd" -ErrorAction SilentlyContinue)
} "Something ran without scripts/env.ps1 - move the AVD to F:\Android\avd"

$running = (adb devices) -match "emulator-\d+\s+device"
if ($running) { Write-Host "[INFO] Emulator running: $($running -join ', ')" -ForegroundColor Cyan }
else { Write-Host "[INFO] No emulator running (tests will boot it automatically)" -ForegroundColor Cyan }

if ($failed) { Write-Host "`n$failed check(s) failed." -ForegroundColor Red; exit 1 }
Write-Host "`nAll checks passed." -ForegroundColor Green
