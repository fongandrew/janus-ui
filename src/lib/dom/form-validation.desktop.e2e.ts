import { expect, test } from '@playwright/test';

test.describe('Form Validation', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/src/lib/dom/test-harness.html');
	});

	test('shows validation errors on submit with empty required fields', async ({ page }) => {
		await page.locator('#test-form button[type="submit"]').click();
		const nameErr = page.locator('#test-name-err');
		await expect(nameErr).not.toBeEmpty();
	});

	test('clears error when field is fixed', async ({ page }) => {
		await page.locator('#test-form button[type="submit"]').click();
		await expect(page.locator('#test-name-err')).not.toBeEmpty();

		await page.locator('#test-name').fill('John');
		await page.locator('#test-name').dispatchEvent('change');
		await expect(page.locator('#test-name-err')).toBeEmpty();
	});

	test('successful submit calls handler', async ({ page }) => {
		await page.locator('#test-name').fill('John');
		await page.locator('#test-email').fill('john@example.com');
		await page.locator('#test-form button[type="submit"]').click();

		await expect(page.locator('#form-result')).toContainText('Submitted: John / john@example.com');
	});

	test('email validation shows error for invalid format', async ({ page }) => {
		await page.locator('#test-name').fill('John');
		await page.locator('#test-email').fill('not-an-email');
		await page.locator('#test-form button[type="submit"]').click();

		await expect(page.locator('#test-email-err')).not.toBeEmpty();
	});
});
