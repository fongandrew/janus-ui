import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('details-demo', (getContainer) => {
	test('opens and closes details when clicking the summary', async () => {
		const container = getContainer();

		const details = container.getByTestId('details-1');
		const summary = container.getByText('Click to expand');
		const content = details.locator('summary + *');
		await expect(content).not.toBeVisible();

		await summary.click();
		await expect(content).toBeVisible();
	});

	test('can open and close details using keyboard interaction', async ({ page }) => {
		const container = getContainer();

		const details = container.getByTestId('details-1');
		const summary = details.locator('summary');
		await summary.focus();

		const content = details.locator('summary + *');

		// Press Enter to open
		await page.keyboard.press('Enter');
		await expect(content).toBeVisible();

		// Press Enter again to close
		await page.keyboard.press('Enter');
		await expect(content).not.toBeVisible();

		// Try with Space key
		await page.keyboard.press('Space');
		await expect(content).toBeVisible();

		// Press Space again to close
		await page.keyboard.press('Space');
		await expect(content).not.toBeVisible();
	});
});
