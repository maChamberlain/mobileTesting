# Status - mobile browser testing setup

**Last updated:** 2026-09-23
**State:** Working end to end. The desktop Playwright suite (`F:\Documents\code\projects\git\playwright`)
is ported to mobile Chrome: `npm test` passes 8/8 (4 specs) on the `pixel7_api34` emulator.
See README.md for usage, the port's design differences, and gotchas.

## Done

- [x] SVM Mode enabled in BIOS (verified via `systeminfo`)
- [x] **AEHD 2.2** hypervisor driver installed (the user chose it over WHPX so the Windows
      hypervisor doesn't run all the time; see README for the WHPX fallback)
- [x] JDK 21, Android SDK, AVD, Appium drivers, chromedriver - all under `F:\Android`
- [x] Appium 3.7.0 + uiautomator2 driver 8.7.0
- [x] `tsconfig.json`, `wdio.conf.ts` with `TEST_TARGET=emulator|device|cloud` switch
- [x] `scripts/avd-create|avd-start|avd-stop|doctor.ps1` (doctor: all checks pass)
- [x] Ported the Playwright suite to `tests/` with the same structure (components, pages, fixtures,
      smoke-tests, search-tests). The user approved these deviations: fixtures as setup functions
      + beforeEach, explicit `open()` hamburger step, tags in describe titles + `test:smoke`/`test:search`
      scripts, and deleting the earlier demo spec
- [x] Added `baseUrl`, CI-only retries and `forbidOnly` to mirror playwright.config.js
- [x] Type-check clean (`npx tsc -p .`)
- [x] GitHub Actions workflow `.github/workflows/mobile-tests.yml` (ubuntu + KVM +
      reactivecircus/android-emulator-runner, cached AVD snapshot). `wdio.conf.ts` only applies the
      F:\Android paths on Windows. **Not yet run on GitHub** - project isn't a git repo/pushed yet
- [x] C: stayed clean (`C:\Users\zipti\.android\avd` does not exist)

## Resolved issues (for history)

1. `sdkmanager --licenses` piping `y` silently installs nothing - wrote license hash files directly.
2. uiautomator2 needs Appium 3 - bumped `appium` to ^3.7.0.
3. SVM alone isn't enough - the emulator also needs AEHD or WHPX (`emulator -accel-check`).
4. chromedriver autodownload needs `allowInsecure: 'uiautomator2:chromedriver_autodownload'`
   as a **string** in the appium-service args (arrays get JSON-encoded and ignored).
5. PowerShell 5.1 mis-parses non-ASCII chars in BOM-less `.ps1` files - keep scripts ASCII.
6. Enter doesn't submit the DocSearch modal on Android (IME composition, `isComposing=true`) - use
   `mobile: performEditorAction` {action: 'search'}.
7. After moving the project into `git\`, the `F:\Android\appium-home\node_modules\appium` link
   was missing ("Cannot find package 'appium'"). Recreated it as a junction to the project's `node_modules\appium`.

## Possible next steps (not started)

- Port any new Playwright specs the same way (see README design-notes table)
- ESLint: the Playwright repo has eslint + eslint-plugin-playwright; this project has no linter yet
- Newer Chrome: the `google_apis` image ships Chrome 113. For current Chrome, either update it
  through the Play Store (needs a `google_apis_playstore` image) or install a newer Chrome APK
- `test:device` and `test:cloud` targets are wired up but untested (no phone / no cloud account yet)
- Push to GitHub and confirm the first CI run is green
