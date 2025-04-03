import { defineConfig, devices } from '@playwright/test';

const isCI = !!(process.env as Record<string, string>)['CI'];

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	// Run tests in files ending with .e2e.ts, .e2e.tsx, .e2e.js, or .e2e.jsx
	testMatch: '**/*.e2e.[tj]s?(x)',

	// Reporter to use
	reporter: [['html'], ['list']],

	// Each test is given 30 seconds
	timeout: 30000,

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

	// Configure projects for major browsers
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'] },
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
		{
			name: 'webkit',
			use: { ...devices['Desktop Safari'] },
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
