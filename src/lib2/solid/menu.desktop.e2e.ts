import { expect, test } from '@playwright/test';

/** Solid-layer Menu/MenuItem (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('renders the documented classes and behavior tokens', async ({ page }) => {
	const menu = page.locator('#demo-menu');
	await expect(menu).toHaveClass(/c-menu/);
	await expect(menu).toHaveClass(/o-menu/);
	await expect(menu).toHaveAttribute('role', 'menu');
	await expect(menu).toHaveAttribute(
		'data-js',
		't-roving-focus t-typeahead-filter t-request-close t-restore-focus',
	);
});

test('opens, arrow keys navigate items, ESC closes', async ({ page }) => {
	const menu = page.locator('#demo-menu');
	await page.locator('#demo-menu-open').click();
	await expect(menu).toBeVisible();

	const items = menu.getByRole('menuitem');
	await items.first().focus();
	await page.keyboard.press('ArrowDown');
	await expect(items.nth(1)).toBeFocused();
	await page.keyboard.press('ArrowUp');
	await expect(items.first()).toBeFocused();

	await page.keyboard.press('Escape');
	await expect(menu).toBeHidden();
});

test('typeahead letter-jump focuses the matching item', async ({ page }) => {
	const menu = page.locator('#demo-menu');
	await page.locator('#demo-menu-open').click();
	await expect(menu).toBeVisible();
	await menu.getByRole('menuitem').first().focus();

	await page.keyboard.press('c');
	await expect(menu.getByRole('menuitem', { name: 'Charlie' })).toBeFocused();
});

test('selecting an item runs its handler and closes the menu', async ({ page }) => {
	const menu = page.locator('#demo-menu');
	await page.locator('#demo-menu-open').click();
	await menu.getByRole('menuitem', { name: 'Bravo' }).click();
	await expect(page.locator('#menu-output')).toHaveText('Bravo');
	await expect(menu).toBeHidden();
});
