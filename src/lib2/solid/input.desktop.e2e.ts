import { expect, test } from '@playwright/test';

/** Solid-layer Input + LabelledInput (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('LabelledInput wires the label, description, and error slot', async ({ page }) => {
	const demo = page.locator('#inputs-demo');
	const input = demo.getByLabel('Email');
	await expect(input).toHaveId('demo-input');
	await expect(input).toHaveClass(/c-input/);
	await expect(input).toHaveClass(/o-input-box/);
	await expect(input).toHaveAttribute('placeholder', 'you@example.com');
	await expect(input).toHaveAttribute('aria-labelledby', 'demo-input-label');
	await expect(input).toHaveAttribute('aria-describedby', 'demo-input-desc demo-input-err');
	await expect(demo.locator('#demo-input-desc')).toHaveText('We never share this.');
	await expect(demo.locator('#demo-input-err')).toHaveAttribute('data-js', 't-validate-error');
});

test('aria-describedby skips the description id when none is rendered', async ({ page }) => {
	const input = page.locator('#textareas-demo').getByLabel('Notes');
	await expect(input).toHaveAttribute('aria-describedby', 'demo-textarea-err');
});

test('prop-controlled errorMessage renders the slot and marks it external', async ({ page }) => {
	const demo = page.locator('#inputs-demo');
	await expect(demo.locator('#demo-input-error')).toHaveAttribute('aria-invalid', 'true');
	const slot = demo.locator('#demo-input-error-err');
	await expect(slot).toHaveText('This error is prop-controlled.');
	await expect(slot).toHaveAttribute('data-external-error', '');
});

test('disabled renders aria-disabled, never native disabled', async ({ page }) => {
	const input = page.locator('#demo-input-disabled');
	await expect(input).toHaveAttribute('aria-disabled', 'true');
	expect(await input.getAttribute('disabled')).toBeNull();
	expect(await input.evaluate((el: HTMLInputElement) => el.disabled)).toBe(false);
	// Stays focusable — the whole point of aria-disabled (§13.1)
	await input.focus();
	await expect(input).toBeFocused();
});
