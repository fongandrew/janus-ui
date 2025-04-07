import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('tooltips-demo', (getContainer) => {
	test('tooltips appear on hover', async ({ page }) => {
		const container = getContainer();

		// Check top tooltip
		const topButton = container.getByRole('button', { name: 'Top' });
		await topButton.hover();

		// Wait for tooltip to be visible
		const tooltips = container.getByRole('tooltip');
		const visibleTooltip = tooltips.filter({ hasText: "Hello, I'm the top tooltip" });
		await expect(visibleTooltip).toBeVisible();

		// Move away and check tooltip disappears
		await page.mouse.move(0, 0);
		await expect(visibleTooltip).not.toBeVisible();
	});

	test('tooltips appear on focus', async ({ page }) => {
		const container = getContainer();

		// Focus the bottom button using keyboard navigation
		const bottomButton = container.getByRole('button', { name: 'Bottom' });
		await bottomButton.focus();

		// Check tooltip is visible
		const tooltips = container.getByRole('tooltip');
		const visibleTooltip = tooltips.filter({ hasText: "Hello, I'm the bottom tooltip" });
		await expect(visibleTooltip).toBeVisible();

		// Blur and check tooltip disappears
		await page.keyboard.press('Tab'); // Move focus away
		await expect(visibleTooltip).not.toBeVisible();
	});

	test('tooltip has correct ARIA relationship with trigger', async () => {
		const container = getContainer();

		// Get the button and check it has aria-describedby
		const topButton = container.getByRole('button', { name: 'Top' });

		// Get the aria-describedby value
		const describedById = await topButton.getAttribute('aria-describedby');
		expect(describedById).not.toBeNull();

		// Check that the tooltip has the matching ID
		if (describedById) {
			const tooltip = container.locator(`[id="${describedById}"]`);
			await expect(tooltip).toHaveAttribute('role', 'tooltip');
			await expect(tooltip).toHaveText("Hello, I'm the top tooltip");
		}
	});
});
