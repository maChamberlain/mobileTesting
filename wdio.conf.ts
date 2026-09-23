import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Runs on GitHub Actions (.github/workflows/mobile-tests.yml), which boots the
// emulator before `npm test`. Only `capabilities` (and, for cloud, the
// connection details) change between targets:
//   TEST_TARGET=emulator  (default) the CI emulator, Appium started by @wdio/appium-service
//   TEST_TARGET=cloud     remote Appium grid (CLOUD_HOSTNAME, CLOUD_USER, CLOUD_KEY)
type Target = 'emulator' | 'cloud'
const target = (process.env.TEST_TARGET ?? 'emulator') as Target

const chromedriverDir = path.join(os.homedir(), '.cache', 'chromedriver')
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
    },
    cloud: {
        ...chromeBase,
        'appium:deviceName': process.env.CLOUD_DEVICE ?? 'Google Pixel 7',
        'appium:platformVersion': process.env.CLOUD_PLATFORM_VERSION ?? '14.0',
    },
}

const useLocalAppium = target === 'emulator'

export const config: WebdriverIO.Config = {
    runner: 'local',
    specs: ['./tests/**/*.spec.ts'],
    // Specs navigate with relative paths, e.g. browser.url('/docs/intro')
    baseUrl: 'https://playwright.dev',
    maxInstances: 1,
    capabilities: [capabilities[target]],

    ...(useLocalAppium
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
    // Mocha's retries don't cover hooks, and the CI emulator occasionally loses
    // Chrome mid-spec ("not connected to DevTools"). Rerun the whole spec file.
    specFileRetries: 1,
    waitforTimeout: 15_000,
    connectionRetryTimeout: 180_000,
    connectionRetryCount: 1,

    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        // Fail the build if a .only was left in the source code
        forbidOnly: true,
        retries: 1,
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
