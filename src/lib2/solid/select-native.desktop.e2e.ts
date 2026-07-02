import { expect, test } from '@playwright/test';

/** Solid-layer SelectNative (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('renders options from the options prop and selection works', async ({ page }) => {
	const select = page.locator('#selects-demo').getByLabel('Flavor');
	await expect(select).toHaveClass(/c-select-native/);
	await expect(select).toHaveClass(/o-input-box/);
	await expect(select.locator('option')).toHaveCount(3);

	await select.selectOption('stracciatella');
	await expect(select).toHaveValue('stracciatella');
});

test('renders <option> children directly', async ({ page }) => {
	const select = page.locator('#demo-select-children');
	await expect(select).toHaveValue('m');
	await select.selectOption('l');
	await expect(select).toHaveValue('l');
});
