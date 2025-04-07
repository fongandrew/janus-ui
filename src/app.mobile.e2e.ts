import '~/app.desktop.e2e';

import { expect, test } from '@playwright/test';

for (const path of ['/', '/ssr']) {
	test.describe(`${path}: top-nav-layout`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(path);
		});

		test('can open and close sidebar', async ({ page }) => {
			const topNav = page.locator('header:has(h1)');
			await expect(topNav).toBeVisible();

			await topNav.getByLabel('Open Menu').tap();
			const nav = topNav.getByRole('navigation');
			await expect(nav).toBeVisible();

			await topNav.getByLabel('Close Menu').tap();
			await expect(nav).not.toBeVisible();
		});
	});
}
