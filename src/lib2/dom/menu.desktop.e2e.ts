import { expect, test } from '@playwright/test';

/** DOM-layer menu behavior (PLAN 5.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-dom.html');
});

test('opens, arrow keys navigate items, ESC closes', async ({ page }) => {
	const menu = page.locator('#dom-menu');
	await page.locator('#dom-menu-open').click();
	await expect(menu).toBeVisible();

	const items = menu.getByRole('menuitem');
	await items.first().focus();
	await page.keyboard.press('ArrowDown');
	await expect(items.nth(1)).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(items.nth(2)).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await expect(items.nth(1)).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
});

test('typeahead letter-jump focuses the matching item', async ({ page }) => {
	const menu = page.locator('#dom-menu');
	await page.locator('#dom-menu-open').click();
	await expect(menu).toBeVisible();
	await menu.getByRole('menuitem').first().focus();

	await page.keyboard.press('c');
	await expect(menu.getByRole('menuitem', { name: 'Charlie' })).toBeFocused();
	// The buffer window expires; a fresh letter jumps again
	await page.waitForTimeout(600);
	await page.keyboard.press('b');
	await expect(menu.getByRole('menuitem', { name: 'Bravo' })).toBeFocused();
});
