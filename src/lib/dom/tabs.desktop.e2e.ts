import { expect, test } from '@playwright/test';

test.describe('Tabs', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/src/lib/dom/test-harness.html');
	});

	test('clicking a tab selects it and shows its panel', async ({ page }) => {
		const tab2 = page.locator('#tab-2');
		await tab2.click();
		await expect(tab2).toHaveAttribute('aria-selected', 'true');
		await expect(page.locator('#tab-panel-2')).not.toHaveAttribute('hidden', '');
		await expect(page.locator('#tab-panel-1')).toHaveAttribute('hidden', '');
	});

	test('arrow key navigation between tabs', async ({ page }) => {
		const tab1 = page.locator('#tab-1');
		await tab1.focus();
		await page.keyboard.press('ArrowRight');
		await expect(page.locator('#tab-2')).toBeFocused();
		await page.keyboard.press('ArrowRight');
		await expect(page.locator('#tab-3')).toBeFocused();
		await page.keyboard.press('ArrowRight');
		await expect(page.locator('#tab-1')).toBeFocused();
	});

	test('Home and End keys jump to first/last tab', async ({ page }) => {
		const tab2 = page.locator('#tab-2');
		await tab2.focus();
		await page.keyboard.press('Home');
		await expect(page.locator('#tab-1')).toBeFocused();
		await page.keyboard.press('End');
		await expect(page.locator('#tab-3')).toBeFocused();
	});
});
