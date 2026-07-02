import { expect, test } from '@playwright/test';

const PAGE = '/site/solid-test-app.html';

test.describe('Solid wrappers — buttons', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('Button click fires its handler', async ({ page }) => {
		await expect(page.getByTestId('click-count')).toHaveText('0');
		await page.getByTestId('btn-default').click();
		await page.getByTestId('btn-default').click();
		await expect(page.getByTestId('click-count')).toHaveText('2');
	});

	test('variants render v-colors-* and IconButton renders the icon modifier', async ({
		page,
	}) => {
		await expect(page.getByTestId('btn-primary')).toHaveClass(/v-colors-primary/);
		await expect(page.getByTestId('btn-danger')).toHaveClass(/v-colors-danger/);
		await expect(page.getByTestId('btn-icon')).toHaveClass(/c-button--icon/);
	});
});

test.describe('Solid wrappers — labelled input', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('input is wired to its label/description via aria + id', async ({ page }) => {
		const input = page.getByTestId('labelled-input');
		await expect(input).toHaveAttribute('id', 'contact-email');
		await expect(input).toHaveAttribute('aria-labelledby', 'contact-email-label');
		await expect(input).toHaveAttribute('aria-describedby', /contact-email-desc/);
		await expect(page.locator('#contact-email-label')).toHaveAttribute('for', 'contact-email');
	});
});

test.describe('Solid wrappers — checkbox', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('toggles checked on click', async ({ page }) => {
		const checkbox = page.getByTestId('checkbox');
		await expect(checkbox).not.toBeChecked();
		await checkbox.click();
		await expect(checkbox).toBeChecked();
		await checkbox.click();
		await expect(checkbox).not.toBeChecked();
	});
});

test.describe('Solid wrappers — tabs', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('click selects a tab and toggles panel visibility', async ({ page }) => {
		await expect(page.getByTestId('panel-a')).toBeVisible();
		await expect(page.getByTestId('panel-b')).toBeHidden();

		await page.getByTestId('tab-b').click();
		await expect(page.getByTestId('tab-b')).toHaveAttribute('aria-selected', 'true');
		await expect(page.getByTestId('tab-a')).toHaveAttribute('aria-selected', 'false');
		await expect(page.getByTestId('panel-b')).toBeVisible();
		await expect(page.getByTestId('panel-a')).toBeHidden();
	});

	test('arrow keys move focus across tabs', async ({ page }) => {
		await page.getByTestId('tab-a').focus();
		await page.keyboard.press('ArrowRight');
		await expect(page.getByTestId('tab-b')).toBeFocused();
		await page.keyboard.press('ArrowLeft');
		await expect(page.getByTestId('tab-a')).toBeFocused();
	});
});

test.describe('Solid wrappers — modal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('opens via the trigger and closes on ESC', async ({ page }) => {
		await expect(page.getByTestId('modal')).toBeHidden();
		await page.getByTestId('modal-trigger').click();
		await expect(page.getByTestId('modal')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('modal')).toBeHidden();
	});
});

test.describe('Solid wrappers — form', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('submit empty shows a required error; fill + submit calls the handler', async ({
		page,
	}) => {
		await page.getByTestId('form-submit').click();
		await expect(page.locator('#signup-email-err')).not.toBeEmpty();
		await expect(page.getByTestId('form-input')).toHaveAttribute('aria-invalid', 'true');
		await expect(page.getByTestId('form-output')).toBeEmpty();

		await page.getByTestId('form-input').fill('user@example.com');
		await page.getByTestId('form-submit').click();
		await expect(page.getByTestId('form-output')).toHaveText('Submitted: user@example.com');
	});
});
