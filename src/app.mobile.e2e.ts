import { expect, test } from '@playwright/test';

for (const path of ['/', '/ssr']) {
	test.describe(`${path}: top-nav-layout`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(path);
		});

		test('top nav visibility when scrolling', async ({ page }) => {
			const topNav = page.locator('header:has(h1)');
			await expect(topNav).toBeVisible();

			// Reliably simulating mobile swipe scrolling in finicky and wheel events
			// aren't supported in Safari, so so manully scroll element after sidebar
			// to hide nav
			await page.evaluate(() =>
				document
					.querySelector('[role="complementary"] + *')
					?.scrollBy({ left: 0, top: 300, behavior: 'smooth' }),
			);
			await expect(topNav).not.toBeInViewport();

			// Scroll back up to reveal the nav
			await page.evaluate(() =>
				document
					.querySelector('[role="complementary"] + *')
					?.scrollBy({ left: 0, top: -200, behavior: 'smooth' }),
			);
			await expect(topNav).toBeInViewport();
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
