# Mobile browser testing

[![Mobile Chrome Tests](https://github.com/maChamberlain/mobileTesting/actions/workflows/mobile-tests.yml/badge.svg)](https://github.com/maChamberlain/mobileTesting/actions/workflows/mobile-tests.yml)

This repo is a TypeScript example of mobile browser automation.
It runs four test files against the Playwright documentation site.
*Browser:* Tests run on Chrome using an Android emulator, with Appium 3 and WebdriverIO 9 (Mocha).

This is a CI-only project: the tests run on GitHub Actions, not on a local machine.

## Running the tests

The workflow runs automatically on every push and pull request to `main`. To run it by hand,
open the **Actions** tab, pick **Mobile Chrome Tests** and click **Run workflow**.

Each run uploads a `test-output` artifact with `logs/` (`wdio-appium.log` is the useful one)
and `screenshots/` (one per failed test).

## Test list

| Test Area | Tag | Description | Spec File |
| --- | --- | --- | --- |
| Top Nav Bar | `@smoke` | Validates all top nav items are displayed (in the hamburger menu) on the Home, Docs, and MCP pages | `webdriver.top-nav.spec.ts` |
| Basic Home Page Navigation | `@smoke` | Validates top nav links navigate from the Home page to the correct pages | `webdriver.basic-homepage-navigation.spec.ts` |
| Leftside Nav Navigation | `@smoke` | Validates Docs sidebar items (Installation, Writing tests) navigate to the correct pages | `webdriver.left-nav-navigation.spec.ts` |
| Basic Search | `@search` | Validates searching for 'mcp' navigates to the MCP Introduction page | `webdriver.basic-search.spec.ts` |

`npm test` runs everything. `npm run test:smoke` and `npm run test:search` run one tag. To run a
single tag in CI, change the `script:` line of the **Run tests on emulator** step.

## How the pipeline works

`.github/workflows/mobile-tests.yml`, on an `ubuntu-latest` runner:

1. Enables KVM, which the x86_64 emulator needs
2. Installs Node, Java 21, the npm packages and the Appium UiAutomator2 driver
3. Type-checks the project (`npx tsc -p .`)
4. Boots a `pixel7_api34` emulator (API 34, `google_apis`, x86_64, Pixel 7, 4 GB RAM, 4 cores)
   with `reactivecircus/android-emulator-runner`. A snapshot of the booted emulator is cached,
   so only the first run (or the first after the cache expires, 7 days unused) pays for a cold boot
5. Runs `npm test`. `@wdio/appium-service` starts Appium, which attaches to the running emulator
6. Uploads the `test-output` artifact

A run takes about 5 minutes.

## Design notes

Page Object Models with composed components.

## Configuration options

| Option | Setting |
| --- | --- |
| Base URL | `https://playwright.dev` |
| Retry | 1 per test, plus 1 rerun of a whole failed spec file (Mocha retries don't cover hooks) |
| `.only` | Fails the run |
| Screenshot | On failure, `screenshots/FAILED_<test title>.png` |
| Logs | `logs/` |

## Targets

`TEST_TARGET` in `wdio.conf.ts` selects `emulator` (default, what CI uses) or `cloud`. The specs
are the same for both. Only the capabilities change. `cloud` connects to a remote Appium grid
and reads `CLOUD_HOSTNAME`, `CLOUD_USER`, `CLOUD_KEY` and optionally `CLOUD_DEVICE` /
`CLOUD_PLATFORM_VERSION`. The workflow only runs `emulator`: to use `cloud`, store those values
as repository secrets and pass them, with `TEST_TARGET: cloud`, as `env` on a test step.

## Gotchas

- **chromedriver must match the device's Chrome** (the emulator image ships Chrome 113).
  Appium downloads the right one into `~/.cache/chromedriver` automatically. That only works
  because the service starts Appium with `--allow-insecure uiautomator2:chromedriver_autodownload`.
  Appium 3 requires the `uiautomator2:` prefix, and the value must be a **string**: an array
  gets JSON-encoded and Appium silently ignores it.
- **Enter doesn't submit some inputs on Android.** Typed text stays in an IME composition, and
  handlers that check `isComposing` ignore the key. Use the keyboard's action key instead
  (`mobile: performEditorAction`), as `TopNav.pressKeyboardSearchKey()` does.
- **The CI emulator can lose Chrome mid-spec** (`disconnected: not connected to DevTools`).
  The emulator's extra RAM and the spec-file retry are what keep this from failing runs.
