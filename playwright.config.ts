import { defineConfig, devices } from '@playwright/test';

const isCI = !!(process.env as Record<string, string>)['CI'];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	// Reporter to use
	reporter: [['html', { open: 'never' }], ['list']],

	// Give CI a bit more time, fail faster locally to make dev less annoying
	timeout: isCI ? 30000 : 10000,

	// Fail the build on CI if you accidentally left test.only in the source code.
	forbidOnly: !!isCI,

	// Retry on CI only
	retries: isCI ? 2 : 0,

	// Opt out of parallel tests on CI
	workers: isCI ? 1 : '50%',

	// Configure Vite dev server to run before the tests
	webServer: {
		command: 'npm run dev',
		port: 3000,
		reuseExistingServer: !isCI,
		timeout: 120000,
	},

	// Configure projects for desktop and mobile browsers.
	//
	// Tests are tiered by browser support (PLAN.md §0.4). v2 leans on a few
	// Chromium-only features (anchor positioning, `commandfor`, `scroll-state()`).
	// Tests exercising those tag their title with `@chromium-only`; the Firefox
	// and WebKit projects skip them via `grepInvert` so the suite stays honest —
	// cross-browser features run cross-browser, Chromium-only ones run scoped.
	projects: [
		// Tier 1: Chromium — runs every test, including `@chromium-only`.
		{
			name: 'chromium-desktop',
			testMatch: '**/*.desktop.e2e.[tj]s?(x)',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'chromium-mobile',
			testMatch: '**/*.mobile.e2e.[tj]s?(x)',
			use: { ...devices['Pixel 7'] },
		},

		// Tier 2: cross-browser — skips `@chromium-only` tests.
		{
			name: 'firefox-desktop',
			testMatch: '**/*.desktop.e2e.[tj]s?(x)',
			grepInvert: /@chromium-only/,
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit-desktop',
			testMatch: '**/*.desktop.e2e.[tj]s?(x)',
			grepInvert: /@chromium-only/,
			use: { ...devices['Desktop Safari'] },
		},
		{
			name: 'webkit-mobile',
			testMatch: '**/*.mobile.e2e.[tj]s?(x)',
			grepInvert: /@chromium-only/,
			use: { ...devices['iPhone 15'] },
		},
	],

	// Configure all tests to use this base setup
	use: {
		// Base URL to use in actions like `await page.goto('/')`
		baseURL: 'http://localhost:3000',

		// Collect trace when retrying the failed test
		trace: 'on-first-retry',

		// Take screenshot on test failure
		screenshot: 'only-on-failure',

		// Record video only when retrying a test for the first time
		video: 'on-first-retry',
	},
});
