import { expect, test } from '@playwright/test';

/** DOM-layer form engine (PLAN 5.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-dom.html');
});

test('submitting an empty form shows errors and focuses the first invalid field', async ({
	page,
}) => {
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(page.locator('#dom-email-err')).not.toHaveText('');
	await expect(page.locator('#dom-email')).toBeFocused();
	await expect(page.locator('#dom-email')).toHaveAttribute('aria-invalid', 'true');
});

test('fixing a field clears its error live; remaining errors persist', async ({ page }) => {
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(page.locator('#dom-email-err')).not.toHaveText('');
	await expect(page.locator('#dom-user-err')).not.toHaveText('');

	// Once a field shows an error it validates live on input
	await page.locator('#dom-email').fill('a@b.co');
	await expect(page.locator('#dom-email-err')).toHaveText('');
	await expect(page.locator('#dom-user-err')).not.toHaveText('');
});

test('named validators from data-validators run after native checks', async ({ page }) => {
	await page.locator('#dom-email').fill('a@b.co');
	await page.locator('#dom-user').fill('bobby');
	await page.getByRole('button', { name: 'Submit' }).click();
	await expect(page.locator('#dom-user-err')).toHaveText('No Bobs allowed');

	await page.locator('#dom-user').fill('carol');
	await expect(page.locator('#dom-user-err')).toHaveText('');
});

test('successful submit calls the handler and resets the form', async ({ page }) => {
	await page.locator('#dom-email').fill('a@b.co');
	await page.locator('#dom-user').fill('carol');
	await page.getByRole('button', { name: 'Submit' }).click();

	await expect(page.locator('#dom-form-output')).toHaveText('Submitted: a@b.co / carol');
	// choreography resets on { ok: true }
	await expect(page.locator('#dom-email')).toHaveValue('');
});

test('untouched fields stay quiet when another field changes', async ({ page }) => {
	await page.locator('#dom-email').fill('not-an-email');
	await page.locator('#dom-email').blur();
	await expect(page.locator('#dom-email-err')).not.toHaveText('');
	// username untouched → no premature red text
	await expect(page.locator('#dom-user-err')).toHaveText('');
});
