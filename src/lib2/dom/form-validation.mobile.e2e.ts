import { expect, test } from '@playwright/test';

/** DOM-layer form engine, touch path (PLAN 5.T). */

test.beforeEach(async ({ page }) => {
	await page.goto('/v2-dom.html');
});

test('tap-submit on an empty form shows errors', async ({ page }) => {
	await page.getByRole('button', { name: 'Submit' }).tap();
	await expect(page.locator('#dom-email-err')).not.toHaveText('');
	await expect(page.locator('#dom-email')).toHaveAttribute('aria-invalid', 'true');
});

test('tap-to-focus, type, tap-submit succeeds', async ({ page }) => {
	await page.locator('#dom-email').tap();
	await page.locator('#dom-email').fill('a@b.co');
	await page.locator('#dom-user').tap();
	await page.locator('#dom-user').fill('carol');
	await page.getByRole('button', { name: 'Submit' }).tap();
	await expect(page.locator('#dom-form-output')).toHaveText('Submitted: a@b.co / carol');
});
