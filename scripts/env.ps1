# Central environment for this project.
# Everything lives on F: so the Android SDK, AVD images and Appium drivers
# never touch the C: drive (which only has ~10 GB free).
#
# Dot-source it:  . .\scripts\env.ps1

$Root = "F:\Android"

$env:JAVA_HOME       = "$Root\jdk-21"
$env:ANDROID_HOME    = "$Root\Sdk"
$env:ANDROID_SDK_ROOT= "$Root\Sdk"
# The big one: without this, AVD disk images land in C:\Users\<you>\.android\avd
$env:ANDROID_AVD_HOME= "$Root\avd"
# Keeps Appium's downloaded drivers off C:\Users\<you>\.appium
$env:APPIUM_HOME     = "$Root\appium-home"

$env:PATH = @(
  "$env:JAVA_HOME\bin"
  "$env:ANDROID_SDK_ROOT\platform-tools"
  "$env:ANDROID_SDK_ROOT\emulator"
  "$env:ANDROID_SDK_ROOT\cmdline-tools\latest\bin"
  $env:PATH
) -join ';'

# Name of the AVD created by scripts/avd-create.ps1
$env:AVD_NAME = "pixel7_api34"
