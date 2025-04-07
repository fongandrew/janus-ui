import { expect, test } from '@playwright/test';

for (const path of ['/', '/ssr']) {
	test.describe(`${path}: sidebar-layout`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(path);
		});

		test('can open and close sidebar', async ({ page }) => {
			// Mobile: Starts hidden
			const sidebar = page.getByRole('complementary');
			await expect(sidebar).not.toBeVisible();

			// Open it
			const header = page.locator('header');
			await header.getByLabel('Open Sidebar').tap();
			await expect(sidebar).toBeVisible();

			// Close sidebar by tapping overly
			const viewport = page.viewportSize();
			if (!viewport) throw new Error('Viewport size is not defined');
			await page.touchscreen.tap(viewport.width - 10, viewport.height - 10);
			await expect(sidebar).not.toBeVisible();
		});

		test('navigates to the correct section when clicking links in the sidebar', async ({
			page,
		}) => {
			const header = page.locator('header');
			await header.getByLabel('Open Sidebar').tap();

			const sidebar = page.getByRole('complementary');
			await sidebar.getByRole('link', { name: 'Tooltips' }).click();
			await expect(page.locator('#tooltips-demo')).toBeInViewport();
		});
	});
}
