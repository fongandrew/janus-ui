import { expect, test } from '@playwright/test';

/** Solid-layer Form/FormError/SubmitButton + LabelledInput validation (PLAN 6.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-solid.html');
});

test('Form renders the engine tokens; SubmitButton targets it via context', async ({ page }) => {
	const form = page.locator('#demo-form');
	await expect(form).toHaveAttribute('data-js', 't-validate t-submit');
	await expect(form).toHaveAttribute('novalidate', '');
	await expect(
		page.locator('#forms-demo').getByRole('button', { name: 'Submit' }),
	).toHaveAttribute('form', 'demo-form');
});

test('submitting empty shows errors in the LabelledInput error slots', async ({ page }) => {
	const demo = page.locator('#forms-demo');
	await demo.getByRole('button', { name: 'Submit' }).click();

	await expect(demo.locator('#demo-form-email-err')).not.toHaveText('');
	await expect(demo.locator('#demo-form-username-err')).not.toHaveText('');
	const email = demo.getByLabel('Email');
	await expect(email).toHaveAttribute('aria-invalid', 'true');
	await expect(email).toBeFocused();
	await expect(demo.locator('#form-output')).toHaveText('');
});

test('fixing a field clears its error; the rest persist until fixed', async ({ page }) => {
	const demo = page.locator('#forms-demo');
	await demo.getByRole('button', { name: 'Submit' }).click();
	await expect(demo.locator('#demo-form-email-err')).not.toHaveText('');

	// Once a field shows an error it re-validates live on input
	await demo.getByLabel('Email').fill('a@b.co');
	await expect(demo.locator('#demo-form-email-err')).toHaveText('');
	await expect(demo.getByLabel('Email')).not.toHaveAttribute('aria-invalid', 'true');
	await expect(demo.locator('#demo-form-username-err')).not.toHaveText('');
});

test('named validators (data-validators) run after native checks', async ({ page }) => {
	const demo = page.locator('#forms-demo');
	await demo.getByLabel('Email').fill('a@b.co');
	await demo.getByLabel('Username (no bob)').fill('bobby');
	await demo.getByRole('button', { name: 'Submit' }).click();
	await expect(demo.locator('#demo-form-username-err')).toHaveText('No Bobs allowed');

	await demo.getByLabel('Username (no bob)').fill('carol');
	await expect(demo.locator('#demo-form-username-err')).toHaveText('');
});

test('FormError displays the form-level error from the handler', async ({ page }) => {
	const demo = page.locator('#forms-demo');
	await demo.getByLabel('Email').fill('a@b.co');
	await demo.getByLabel('Username (no bob)').fill('reject');
	await demo.getByRole('button', { name: 'Submit' }).click();

	const formError = demo.locator('[data-form-error]');
	await expect(formError).toHaveText('Rejected by the server');
	await expect(formError).toHaveClass(/c-alert/);
	await expect(formError).toHaveClass(/v-colors-danger/);
	await expect(demo.locator('#form-output')).toHaveText('');
});

test('successful submit runs the onSubmit closure and resets the form', async ({ page }) => {
	const demo = page.locator('#forms-demo');
	await demo.getByLabel('Email').fill('a@b.co');
	await demo.getByLabel('Username (no bob)').fill('carol');
	await demo.getByRole('button', { name: 'Submit' }).click();

	await expect(demo.locator('#form-output')).toHaveText('Hello carol');
	await expect(demo.getByLabel('Email')).toHaveValue('');
	await expect(demo.locator('[data-form-error]')).toHaveText('');
});
