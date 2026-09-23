# Mobile browser testing

Automated tests that drive **real Chrome on Android** using Appium 3, WebdriverIO 9 (Mocha) and TypeScript.
By default they run on a local Android emulator (`pixel7_api34`).

> NOTE: All tests run against the Playwright documentation site (a third-party site):
  https://playwright.dev/. They are mobile ports of the desktop Playwright suite in
  `F:\Documents\code\projects\git\playwright`.

## Quick start

```powershell
npm run doctor          # checks every prerequisite
npm test                # boots the emulator if needed, starts Appium, runs the specs
```

`npm test` starts Appium itself through `@wdio/appium-service`, and the `appium:avd`
capability boots the emulator if it isn't already running. You don't need to start either by hand.

## Scripts

| Command | What it does |
|---|---|
| `npm test` / `npm run test:emulator` | Run all specs on the local emulator |
| `npm run test:smoke` | Run only `@smoke` specs |
| `npm run test:search` | Run only `@search` specs |
| `npm run test:device` | Run the same specs on a USB-connected phone (set `DEVICE_UDID` if more than one is attached) |
| `npm run avd:start` / `avd:stop` | Boot or shut down the emulator yourself (faster reruns if left running) |
| `npm run avd:create` | Recreate the AVD (idempotent) |
| `npm run doctor` | PASS/FAIL check of BIOS virtualization, AEHD, JDK, SDK, AVD, Appium, driver |

## Test list

| Test Area | Tag | Description | Spec File |
| --- | --- | --- | --- |
| Top Nav Bar | `@smoke` | Validates all top nav items are displayed (in the hamburger menu) on the Home, Docs, and MCP pages | `webdriver.top-nav.spec.ts` |
| Basic Home Page Navigation | `@smoke` | Validates top nav links navigate from the Home page to the correct pages | `webdriver.basic-homepage-navigation.spec.ts` |
| Leftside Nav Navigation | `@smoke` | Validates Docs sidebar items (Installation, Writing tests) navigate to the correct pages | `webdriver.left-nav-navigation.spec.ts` |
| Basic Search | `@search` | Validates searching for 'mcp' navigates to the MCP Introduction page | `webdriver.basic-search.spec.ts` |

## Design notes

Same structure as the Playwright suite: Page Object Models with composed components.

```
tests/
  components/   TopNav, LeftSideNav           shared UI components
  pages/        BasePage -> *SectionPage -> page objects
  fixtures/     setup functions: create a page object and navigate to it
  smoke-tests/  search-tests/                 specs, one tagged describe block per file
```

Where the port differs from the Playwright original, and why:

| Area | Playwright | Here | Why |
|---|---|---|---|
| Fixtures | `test.extend({...})` | `fixtures.homePage()` etc., called from `beforeEach` | Mocha has no fixture system |
| Tags | `{ tag: '@smoke' }` | `@smoke` at the end of the `describe` title, filtered with `--mochaOpts.grep` | Mocha has no tag option |
| Nav menus | Links visible in the header and sidebar | `topNav.open()` / `leftSideNav.open()` step before using links | At phone width, playwright.dev collapses both into the hamburger menu |
| Search submit | `searchBar.press('Enter')` | `topNav.pressKeyboardSearchKey()` | On Android a WebDriver Enter arrives mid-IME-composition and the search modal ignores it. The keyboard's Search key (`mobile: performEditorAction`) is what a real user presses |
| Locators | `getByRole(...)` | CSS scoped by `aria-label`, link text (`=Docs`), `h1=Heading` | WebdriverIO has no role+name locator. Elements are getters, the WebdriverIO convention |
| URL checks | `toHaveURL('/docs/intro')` | `toHaveUrl(fullUrl('/docs/intro'))` | WebdriverIO's `toHaveUrl` doesn't resolve paths against `baseUrl` |

## Targets

`TEST_TARGET` selects `emulator` (default), `device` or `cloud` in `wdio.conf.ts`. The specs
are the same for every target. Only the capabilities change. `cloud` reads `CLOUD_HOSTNAME`,
`CLOUD_USER`, `CLOUD_KEY` and optionally `CLOUD_DEVICE` / `CLOUD_PLATFORM_VERSION`.

## Configuration options

| Option | Setting |
| --- | --- |
| Base URL | `https://playwright.dev` |
| Retry | 1 in CI (`CI` env var set) |
| `.only` | Fails the run in CI |
| Screenshot | On failure, `screenshots/FAILED_<test title>.png` |
| Logs | `logs/` (`wdio-appium.log` is the useful one) |

## CI (GitHub Actions)

`.github/workflows/mobile-tests.yml` runs the suite on every push/PR to `main` (and manually via
*Run workflow*). It uses an `ubuntu-latest` runner, which supports KVM, plus
`reactivecircus/android-emulator-runner` to boot the same `pixel7_api34` AVD (API 34,
`google_apis`, x86_64, Pixel 7). The booted-emulator snapshot is cached, so only the first run
pays for a cold boot. `logs/` and `screenshots/` are uploaded as the `test-output` artifact.
On CI the `CI` env var enables 1 retry and `forbidOnly`.

## Machine setup (already done on this PC)

C: is nearly full, so everything lives under `F:\Android`: JDK 21, the Android SDK, the AVD
images (`ANDROID_AVD_HOME`), Appium drivers (`APPIUM_HOME`) and chromedriver binaries.
`wdio.conf.ts` sets these env vars itself. For running `adb`/`emulator`/`appium` by hand,
dot-source `scripts/env.ps1` first.

Emulator acceleration uses **AEHD** (Android Emulator Hypervisor Driver), which needs
**SVM Mode** enabled in the BIOS. We chose it over WHPX so the Windows hypervisor doesn't
run all the time. AEHD conflicts with Hyper-V, WSL2 and Docker Desktop. Google is deprecating
it; if a future emulator drops support, switch to WHPX
(`Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform -All`, admin + reboot).

## Gotchas

- **chromedriver must match the device's Chrome** (the emulator image ships Chrome 113).
  Appium downloads the right one into `F:\Android\chromedriver` automatically. That only works
  because the service starts Appium with `--allow-insecure uiautomator2:chromedriver_autodownload`.
  Appium 3 requires the `uiautomator2:` prefix, and the value must be a **string**: an array
  gets JSON-encoded and Appium silently ignores it.
- **Enter doesn't submit some inputs on Android.** Typed text stays in an IME composition, and
  handlers that check `isComposing` ignore the key. Use the keyboard's action key instead
  (`mobile: performEditorAction`), as `TopNav.pressKeyboardSearchKey()` does.
- **PowerShell 5.1 scripts must be pure ASCII** (or UTF-8 *with* BOM). A single em dash
  in a BOM-less file breaks parsing with misleading "missing terminator" errors.
- Don't use `2>&1` on native commands in PowerShell 5.1. Use `2>$null`.
