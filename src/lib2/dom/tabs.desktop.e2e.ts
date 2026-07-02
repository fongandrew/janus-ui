import { expect, test } from '@playwright/test';

/**
 * DOM-layer tabs behavior (PLAN 5.T). Target: the DOM behaviors page —
 * raw HTML + dom/all + mount(), no framework.
 */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-dom.html');
});

test('click selects a tab and toggles panel visibility', async ({ page }) => {
	await expect(page.locator('#dom-panel-1')).toBeVisible();
	await expect(page.locator('#dom-panel-2')).toBeHidden();

	await page.locator('#dom-tab-2').click();
	await expect(page.locator('#dom-tab-2')).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('#dom-tab-1')).toHaveAttribute('aria-selected', 'false');
	await expect(page.locator('#dom-panel-2')).toBeVisible();
	await expect(page.locator('#dom-panel-1')).toBeHidden();
});

test('arrow keys move focus with wrap; Home/End jump to edges', async ({ page }) => {
	await page.locator('#dom-tab-1').click();
	await page.keyboard.press('ArrowRight');
	await expect(page.locator('#dom-tab-2')).toBeFocused();
	await page.keyboard.press('ArrowRight');
	await expect(page.locator('#dom-tab-3')).toBeFocused();
	await page.keyboard.press('ArrowRight');
	await expect(page.locator('#dom-tab-1')).toBeFocused(); // wraps

	await page.keyboard.press('End');
	await expect(page.locator('#dom-tab-3')).toBeFocused();
	await page.keyboard.press('Home');
	await expect(page.locator('#dom-tab-1')).toBeFocused();
});

test('Enter selects the focused tab; roving tabindex demotes the rest', async ({ page }) => {
	await page.locator('#dom-tab-1').click();
	await page.keyboard.press('ArrowRight');
	await page.keyboard.press('Enter');
	await expect(page.locator('#dom-tab-2')).toHaveAttribute('aria-selected', 'true');
	await expect(page.locator('#dom-panel-2')).toBeVisible();

	await expect(page.locator('#dom-tab-2')).toHaveAttribute('tabindex', '0');
	await expect(page.locator('#dom-tab-1')).toHaveAttribute('tabindex', '-1');
});
