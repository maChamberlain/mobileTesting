# Creates the pixel7_api34 AVD under F:\Android\avd (idempotent).
. "$PSScriptRoot\env.ps1"

$image = "system-images;android-34;google_apis;x86_64"

if ((emulator -list-avds) -contains $env:AVD_NAME) {
  Write-Host "AVD '$env:AVD_NAME' already exists in $env:ANDROID_AVD_HOME"
  exit 0
}

sdkmanager $image | Out-Null
"no" | avdmanager create avd --name $env:AVD_NAME --package $image --device "pixel_7" --force
Write-Host "Created AVD '$env:AVD_NAME' in $env:ANDROID_AVD_HOME"
