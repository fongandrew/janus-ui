import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('menus-demo', (getContainer) => {
	test('tapping trigger opens the simple menu and can select items', async () => {
		const container = getContainer();

		// Initial state - output should show no selection
		const output = container.locator('output');
		await expect(output).toContainText('Selected: None');

		// Click the menu button
		const menuButton = container.getByRole('button', { name: 'Simple Menu' });
		await menuButton.tap();

		// Menu should be visible
		const menu = container.getByRole('menu');
		await expect(menu).toBeVisible();

		// Menu items should be visible
		const optionB = menu.getByRole('menuitem', { name: 'Option B' });
		await optionB.tap();

		// Menu should be closed after selection
		await expect(menu).not.toBeVisible();

		// Output should be updated
		await expect(output).toContainText('Selected: b');
	});

	test('can close the menu with dedicated close key', async () => {
		const container = getContainer();

		// Click the menu button
		const menuButton = container.getByRole('button', { name: 'Simple Menu' });
		await menuButton.tap();

		// Menu should be visible
		const menu = container.getByRole('menu');
		await expect(menu).toBeVisible();

		// Press the dedicated close key
		await container.locator(':popover-open').getByText('Close').tap();

		// Menu should be closed
		await expect(menu).not.toBeVisible();
	});
});
