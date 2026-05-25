import { defineConfig, devices } from '@playwright/test';

const isCI = !!(process.env as Record<string, string>)['CI'];

export default defineConfig({
	reporter: [['html', { open: 'never' }], ['list']],
	timeout: isCI ? 30000 : 10000,
	forbidOnly: !!isCI,
	retries: isCI ? 2 : 0,
	workers: isCI ? 1 : '50%',

	webServer: {
		command: 'npm run dev',
		port: 3000,
		reuseExistingServer: !isCI,
		timeout: 120000,
	},

	projects: [
		// Tier 1: Chromium (all features including anchor positioning, commandfor)
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

		// Tier 2: Cross-browser (skip @chromium-only tests)
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

	use: {
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'on-first-retry',
	},
});
