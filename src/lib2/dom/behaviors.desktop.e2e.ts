import { expect, test } from '@playwright/test';

const PAGE = '/site/dom-behaviors.html';

test.describe('DOM behaviors — tabs', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('arrow keys navigate; Home/End jump to edges', async ({ page }) => {
		await page.locator('#tab-1').focus();
		await page.keyboard.press('ArrowRight');
		await expect(page.locator('#tab-2')).toBeFocused();
		await page.keyboard.press('End');
		await expect(page.locator('#tab-3')).toBeFocused();
		await page.keyboard.press('Home');
		await expect(page.locator('#tab-1')).toBeFocused();
	});

	test('click selects a tab and toggles panel visibility', async ({ page }) => {
		await page.locator('#tab-2').click();
		await expect(page.locator('#tab-2')).toHaveAttribute('aria-selected', 'true');
		await expect(page.locator('#tab-1')).toHaveAttribute('aria-selected', 'false');
		await expect(page.locator('#panel-2')).toBeVisible();
		await expect(page.locator('#panel-1')).toBeHidden();
	});
});

test.describe('DOM behaviors — modal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('opens via commandfor, closes on ESC, restores focus', async ({ page }) => {
		await page.locator('#open-modal').click();
		await expect(page.locator('#demo-modal')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.locator('#demo-modal')).toBeHidden();
		await expect(page.locator('#open-modal')).toBeFocused();
	});

	test('closes on backdrop click', async ({ page }) => {
		await page.locator('#open-modal').click();
		await expect(page.locator('#demo-modal')).toBeVisible();
		await page.mouse.click(3, 3); // backdrop
		await expect(page.locator('#demo-modal')).toBeHidden();
	});

	test('close button closes the modal', async ({ page }) => {
		await page.locator('#open-modal').click();
		await page.locator('#close-modal').click();
		await expect(page.locator('#demo-modal')).toBeHidden();
	});
});

test.describe('DOM behaviors — form', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('submit empty shows an error; fixing and submitting succeeds', async ({ page }) => {
		await page.locator('#submit-form').click();
		await expect(page.locator('#email-err')).not.toBeEmpty();
		await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');

		await page.locator('#email').fill('user@example.com');
		await page.locator('#submit-form').click();
		await expect(page.locator('#form-output')).toHaveText('Submitted: user@example.com');
	});

	test('server-fed field error is displayed', async ({ page }) => {
		await page.locator('#email').fill('taken@example.com');
		await page.locator('#submit-form').click();
		await expect(page.locator('#email-err')).toHaveText('Already in use');
	});
});

test.describe('DOM behaviors — menu', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(PAGE);
	});

	test('opens, arrow-navigates, typeahead jumps, ESC closes', async ({ page }) => {
		await page.locator('#open-menu').click();
		await expect(page.locator('#demo-menu')).toBeVisible();

		await page.locator('#menu-apple').focus();
		await page.keyboard.press('ArrowDown');
		await expect(page.locator('#menu-banana')).toBeFocused();

		await page.keyboard.press('c');
		await expect(page.locator('#menu-cherry')).toBeFocused();

		await page.keyboard.press('Escape');
		await expect(page.locator('#demo-menu')).toBeHidden();
	});
});
