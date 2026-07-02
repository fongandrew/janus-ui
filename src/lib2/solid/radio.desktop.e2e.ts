import { expect, test } from '@playwright/test';

/** Solid-layer Radio/RadioGroup + t-roving-focus (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('RadioGroup renders a radiogroup fieldset with the roving-focus token', async ({ page }) => {
	const group = page.locator('#demo-radio-group');
	await expect(group).toHaveAttribute('role', 'radiogroup');
	await expect(group).toHaveAttribute('aria-orientation', 'horizontal');
	await expect(group).toHaveAttribute('data-js', 't-roving-focus');
});

test('arrow keys move focus within the group; Space selects', async ({ page }) => {
	const group = page.locator('#demo-radio-group');
	const radios = group.getByRole('radio');
	await expect(radios.first()).toBeChecked();

	await radios.first().focus();
	await page.keyboard.press('ArrowRight');
	await expect(radios.nth(1)).toBeFocused();
	await page.keyboard.press('ArrowRight');
	await expect(radios.nth(2)).toBeFocused();
	await page.keyboard.press('ArrowLeft');
	await expect(radios.nth(1)).toBeFocused();

	await page.keyboard.press('Space');
	await expect(radios.nth(1)).toBeChecked();
	await expect(radios.first()).not.toBeChecked();
});

test('roving tabindex demotes non-active radios', async ({ page }) => {
	const radios = page.locator('#demo-radio-group').getByRole('radio');
	await radios.first().focus();
	await page.keyboard.press('ArrowRight');
	await expect(radios.nth(1)).toHaveAttribute('tabindex', '0');
	await expect(radios.first()).toHaveAttribute('tabindex', '-1');
});

test('selection updates the checked state via click', async ({ page }) => {
	const radios = page.locator('#demo-radio-group').getByRole('radio');
	await radios.nth(2).click();
	await expect(radios.nth(2)).toBeChecked();
	await expect(radios.first()).not.toBeChecked();
});
