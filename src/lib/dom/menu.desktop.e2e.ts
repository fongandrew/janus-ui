import { expect, test } from '@playwright/test';

test.describe('Menu', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/src/lib/dom/test-harness.html');
	});

	test('opens menu on trigger click', async ({ page }) => {
		await page.locator('#menu-trigger').click();
		const menu = page.locator('#test-menu-popover');
		await expect(menu).toBeVisible();
	});

	test('arrow key navigation through items', async ({ page }) => {
		await page.locator('#menu-trigger').click();
		const menu = page.locator('#test-menu-popover');
		await expect(menu).toBeVisible();

		const items = menu.locator('[role="menuitem"]');
		await items.first().focus();
		await page.keyboard.press('ArrowDown');
		await expect(items.nth(1)).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await expect(items.nth(2)).toBeFocused();
	});

	test('typeahead jumps to matching item', async ({ page }) => {
		await page.locator('#menu-trigger').click();
		const menu = page.locator('#test-menu-popover');
		await expect(menu).toBeVisible();

		const items = menu.locator('[role="menuitem"]');
		await items.first().focus();
		await page.keyboard.press('c');
		await expect(items.nth(2)).toBeFocused();
	});
});
