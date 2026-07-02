import { expect, test } from '@playwright/test';

/** Solid-layer Checkbox (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('click toggles the checked state', async ({ page }) => {
	const checkbox = page.locator('#checkboxes-demo').getByRole('checkbox', { name: 'Basic' });
	await expect(checkbox).toHaveClass(/c-checkbox/);
	await expect(checkbox).not.toBeChecked();
	await checkbox.click();
	await expect(checkbox).toBeChecked();
	await checkbox.click();
	await expect(checkbox).not.toBeChecked();
});

test('checked prop renders checked', async ({ page }) => {
	await expect(
		page.locator('#checkboxes-demo').getByRole('checkbox', { name: 'Checked' }),
	).toBeChecked();
});

test('indeterminate prop sets the DOM property', async ({ page }) => {
	const indeterminate = await page
		.locator('#demo-check-indeterminate')
		.evaluate((el: HTMLInputElement) => el.indeterminate);
	expect(indeterminate).toBe(true);
});

test('disabled renders aria-disabled, never native disabled', async ({ page }) => {
	const checkbox = page.locator('#demo-check-disabled');
	await expect(checkbox).toHaveAttribute('aria-disabled', 'true');
	expect(await checkbox.getAttribute('disabled')).toBeNull();
});
