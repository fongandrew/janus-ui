import { expect, test } from '@playwright/test';

test.describe('Modal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/src/lib/dom/test-harness.html');
	});

	test('opens via commandfor @chromium-only', async ({ page }) => {
		await page.locator('#modal-trigger').click();
		const dialog = page.locator('#test-dialog');
		await expect(dialog).toBeVisible();
	});

	test('closes on ESC @chromium-only', async ({ page }) => {
		await page.locator('#modal-trigger').click();
		const dialog = page.locator('#test-dialog');
		await expect(dialog).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(dialog).not.toBeVisible();
	});

	test('close button closes modal @chromium-only', async ({ page }) => {
		await page.locator('#modal-trigger').click();
		await expect(page.locator('#test-dialog')).toBeVisible();
		await page.locator('#modal-close').click();
		await expect(page.locator('#test-dialog')).not.toBeVisible();
	});
});
