import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Same specs, different targets. Only `capabilities` (and, for cloud, the
// connection details) change between them.
//   TEST_TARGET=emulator  (default) local AVD, Appium started by @wdio/appium-service
//   TEST_TARGET=device    physical phone over USB (set DEVICE_UDID if more than one is attached)
//   TEST_TARGET=cloud     remote Appium grid (CLOUD_HOSTNAME, CLOUD_USER, CLOUD_KEY)
type Target = 'emulator' | 'device' | 'cloud'
const target = (process.env.TEST_TARGET ?? 'emulator') as Target

// On the Windows dev PC, mirror scripts/env.ps1 so `npm test` works without
// dot-sourcing it first. Everything stays on F: — C: is nearly full.
// Elsewhere (the Linux CI runner) the SDK, AVD and Appium use their own defaults.
const isWindows = process.platform === 'win32'
const ANDROID_ROOT = 'F:\\Android'
if (isWindows) {
    process.env.JAVA_HOME ??= `${ANDROID_ROOT}\\jdk-21`
    process.env.ANDROID_HOME ??= `${ANDROID_ROOT}\\Sdk`
    process.env.ANDROID_SDK_ROOT ??= `${ANDROID_ROOT}\\Sdk`
    process.env.ANDROID_AVD_HOME ??= `${ANDROID_ROOT}\\avd`
    process.env.APPIUM_HOME ??= `${ANDROID_ROOT}\\appium-home`
}
const chromedriverDir = isWindows
    ? `${ANDROID_ROOT}\\chromedriver`
    : path.join(os.homedir(), '.cache', 'chromedriver')
const avdName = process.env.AVD_NAME ?? 'pixel7_api34'

const chromeBase = {
    platformName: 'Android',
    browserName: 'Chrome',
    'appium:automationName': 'UiAutomator2',
    'appium:newCommandTimeout': 240,
    // Fetch a chromedriver matching the device's Chrome. The emulator image ships
    // an old Chrome, so a mismatch is otherwise the first failure you hit.
    'appium:chromedriverAutodownload': true,
    'appium:chromedriverExecutableDir': chromedriverDir,
    'goog:chromeOptions': { args: ['--no-first-run', '--disable-fre'] },
}

const capabilities: Record<Target, WebdriverIO.Capabilities> = {
    emulator: {
        ...chromeBase,
        'appium:deviceName': avdName,
        // Boots the AVD if it isn't running yet; reuses it if it is.
        'appium:avd': avdName,
        'appium:avdLaunchTimeout': 300_000,
        'appium:avdReadyTimeout': 300_000,
    },
    device: {
        ...chromeBase,
        'appium:deviceName': 'Android device',
        ...(process.env.DEVICE_UDID ? { 'appium:udid': process.env.DEVICE_UDID } : {}),
    },
    cloud: {
        ...chromeBase,
        'appium:deviceName': process.env.CLOUD_DEVICE ?? 'Google Pixel 7',
        'appium:platformVersion': process.env.CLOUD_PLATFORM_VERSION ?? '14.0',
    },
}

const isLocal = target !== 'cloud'

export const config: WebdriverIO.Config = {
    runner: 'local',
    specs: ['./tests/**/*.spec.ts'],
    // Specs navigate with relative paths, e.g. browser.url('/docs/intro')
    baseUrl: 'https://playwright.dev',
    maxInstances: 1,
    capabilities: [capabilities[target]],

    ...(isLocal
        ? {
              port: 4723,
              services: [
                  [
                      'appium',
                      {
                          args: {
                              // Appium 3 requires driver-scoped feature names. Must be a
                              // comma-separated string: the service JSON-encodes arrays,
                              // which Appium then silently ignores.
                              allowInsecure: 'uiautomator2:chromedriver_autodownload',
                          },
                          logPath: './logs',
                      },
                  ],
              ],
          }
        : {
              hostname: process.env.CLOUD_HOSTNAME,
              user: process.env.CLOUD_USER,
              key: process.env.CLOUD_KEY,
          }),

    logLevel: 'warn',
    outputDir: './logs',
    bail: 0,
    waitforTimeout: 15_000,
    connectionRetryTimeout: 180_000,
    connectionRetryCount: 1,

    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        // Fail the build on CI if a .only was left in the source code
        forbidOnly: !!process.env.CI,
        // Retry on CI only
        retries: process.env.CI ? 1 : 0,
        // First session on a cold emulator installs the UiAutomator2 server APKs.
        timeout: 300_000,
    },

    // saveScreenshot throws if the folder is missing, and git doesn't keep empty folders.
    onPrepare: function () {
        fs.mkdirSync('screenshots', { recursive: true })
        fs.mkdirSync(chromedriverDir, { recursive: true })
    },

    afterTest: async function (test, _context, { passed }) {
        if (!passed) {
            const safe = test.title.replace(/[^a-z0-9]+/gi, '_')
            await browser.saveScreenshot(path.join('screenshots', `FAILED_${safe}.png`))
        }
    },
}
