import { expect, test } from '@playwright/test';

for (const path of ['/', '/ssr']) {
	test.describe(`${path}: top-nav-layout`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(path);
		});

		test('top nav visibility when scrolling', async ({ page }) => {
			const topNav = page.locator('header:has(h1)');
			await expect(topNav).toBeVisible();

			// So scroll is on main area and not sidebar / body
			const main = page.locator('main');
			await main.hover();

			// Scroll down to hide the nav
			await page.mouse.wheel(0, 300);
			await page.waitForTimeout(20);
			await page.mouse.wheel(0, 300);
			await page.waitForTimeout(20);
			await expect(topNav).not.toBeInViewport();

			// Scroll back up to reveal the nav
			await page.mouse.wheel(0, -200);
			await page.waitForTimeout(20);
			await page.mouse.wheel(0, -200);
			await page.waitForTimeout(20);
			await expect(topNav).toBeInViewport();
		});
	});
}
