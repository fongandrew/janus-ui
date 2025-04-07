import { expect, test } from '@playwright/test';

for (const path of ['/', '/ssr']) {
	test.describe(`${path}: sidebar-layout`, () => {
		test.beforeEach(async ({ page }) => {
			await page.goto(path);
		});

		test('can open and close sidebar', async ({ page }) => {
			// Desktop: Starts visible
			const sidebar = page.getByRole('complementary');
			await expect(sidebar).toBeVisible();

			// Close sidebar
			await sidebar.getByLabel('Close Sidebar').click();
			await expect(sidebar).not.toBeVisible();

			// Re-open it
			const header = page.locator('header');
			await header.getByLabel('Open Sidebar').click();
			await expect(sidebar).toBeVisible();
		});

		test('navigates to the correct section when clicking links in the sidebar', async ({
			page,
		}) => {
			const sidebar = page.getByRole('complementary');
			await sidebar.getByRole('link', { name: 'Tooltips' }).click();
			await expect(page.locator('#tooltips-demo')).toBeInViewport();
		});
	});
}
