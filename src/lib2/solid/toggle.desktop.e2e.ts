import { expect, test } from '@playwright/test';

/** Solid-layer Toggle (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('renders role=switch with the c-toggle class', async ({ page }) => {
	const toggle = page.locator('#toggles-demo').getByRole('switch', { name: 'Notifications' });
	await expect(toggle).toHaveClass(/c-toggle/);
	await expect(toggle).not.toBeChecked();
});

test('click toggles the checked state', async ({ page }) => {
	const toggle = page.locator('#toggles-demo').getByRole('switch', { name: 'Notifications' });
	await toggle.click();
	await expect(toggle).toBeChecked();
	await toggle.click();
	await expect(toggle).not.toBeChecked();
});

test('checked prop renders on; disabled renders aria-disabled only', async ({ page }) => {
	const demo = page.locator('#toggles-demo');
	await expect(demo.getByRole('switch', { name: 'On by default' })).toBeChecked();

	const disabled = demo.getByRole('switch', { name: 'Disabled' });
	await expect(disabled).toHaveAttribute('aria-disabled', 'true');
	expect(await disabled.getAttribute('disabled')).toBeNull();
});
