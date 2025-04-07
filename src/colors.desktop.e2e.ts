import { expect, type Page, test } from '@playwright/test';

/**
 * Tests for the colors page, verifying ACPA contrast compliance
 * in both light and dark modes.
 */
test.describe('Colors page', () => {
	// Helper function to check all ACPA contrast indicators
	async function checkContrastCompliance(page: Page) {
		// Navigate to the colors page
		await page.goto('/colors');

		// Check that all ACPA indicators show passing (✓)
		const contrastIndicators = page.getByTestId('acpa-pass');

		// Wait for all contrast indicators to be visible
		await expect(contrastIndicators.first()).toBeVisible();

		// Get the count of contrast indicators
		const count = await contrastIndicators.count();
		expect(count).toBeGreaterThan(0);

		// Check each indicator to ensure it shows a checkmark (✓) and not an X (✗)
		for (let i = 0; i < count; i++) {
			const indicator = contrastIndicators.nth(i);
			await indicator.scrollIntoViewIfNeeded();
			await expect(indicator).toHaveText('✓');
			await expect(indicator).not.toHaveText('✗');
		}
	}

	test('light mode - all colors pass ACPA contrast requirements', async ({ page }) => {
		// Force light mode
		await page.emulateMedia({ colorScheme: 'light' });

		// Check contrast compliance in light mode
		await checkContrastCompliance(page);
	});

	test('dark mode - all colors pass ACPA contrast requirements', async ({ page }) => {
		// Force dark mode
		await page.emulateMedia({ colorScheme: 'dark' });

		// Check contrast compliance in dark mode
		await checkContrastCompliance(page);
	});
});
