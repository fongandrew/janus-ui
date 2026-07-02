import { expect, test } from '@playwright/test';

/** Solid-layer Button/IconButton (PLAN 6.T). Target: the Solid test app. */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('renders the documented class list and variants', async ({ page }) => {
	const demo = page.locator('#buttons-demo');
	const base = demo.getByRole('button', { name: 'Default' });
	await expect(base).toHaveClass(/c-button/);
	await expect(base).toHaveClass(/o-input-box/);

	await expect(demo.getByRole('button', { name: 'Primary' })).toHaveClass(/v-colors-primary/);
	await expect(demo.getByRole('button', { name: 'Danger' })).toHaveClass(/v-colors-danger/);
});

test('disabled renders aria-disabled, never native disabled', async ({ page }) => {
	const disabled = page.locator('#buttons-demo').getByRole('button', { name: 'Disabled' });
	await expect(disabled).toHaveAttribute('aria-disabled', 'true');
	expect(await disabled.getAttribute('disabled')).toBeNull();
	// Stays focusable — the whole point of aria-disabled (§13.1)
	await disabled.focus();
	await expect(disabled).toBeFocused();
});

test('IconButton is square', async ({ page }) => {
	const icon = page.locator('#buttons-demo').getByRole('button', { name: 'Add' });
	await expect(icon).toHaveClass(/c-button--icon/);
	const box = await icon.boundingBox();
	expect(box).not.toBeNull();
	expect(Math.abs(box!.width - box!.height)).toBeLessThan(1);
});
