import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('menus-demo', (getContainer) => {
	test('clicking trigger opens the simple menu and can select items', async () => {
		const container = getContainer();

		// Initial state - output should show no selection
		const output = container.locator('output');
		await expect(output).toContainText('Selected: None');

		// Click the menu button
		const menuButton = container.getByRole('button', { name: 'Simple Menu' });
		await menuButton.click();

		// Menu should be visible
		const menu = container.getByRole('menu');
		await expect(menu).toBeVisible();

		// Menu items should be visible
		const optionB = menu.getByRole('menuitem', { name: 'Option B' });
		await optionB.click();

		// Menu should be closed after selection
		await expect(menu).not.toBeVisible();

		// Output should be updated
		await expect(output).toContainText('Selected: b');
	});

	test('keyboard navigation works in menu', async ({ page }) => {
		const container = getContainer();

		// Open the menu with arrow keys
		const menuButton = container.getByRole('button', { name: 'Simple Menu' });
		await menuButton.focus();
		await page.keyboard.press('ArrowDown');

		// Menu should be visible and first item should be focused
		const menu = container.getByRole('menu');
		await page.waitForTimeout(1000);
		await expect(menu).toBeVisible();
		const optionA = menu.getByRole('menuitem', { name: 'Option A' });
		await expect(optionA).toBeFocused();
		await page.keyboard.press('Enter');

		// Menu should be closed after selection
		await expect(menu).not.toBeVisible();

		// Output should be updated with the selected value
		const output = container.locator('output');
		await expect(output).toContainText('Selected: a');

		// Not sure why but opening too soon after messes with focus state
		await page.waitForTimeout(1000);

		// Open the menu again with the up arrow (select last item) and navigate around
		await page.keyboard.press('ArrowUp');
		await expect(menu).toBeVisible();

		const optionC = menu.getByRole('menuitem', { name: 'Option C' });
		await expect(optionC).toBeFocused();

		await page.keyboard.press('ArrowUp');
		const optionB = menu.getByRole('menuitem', { name: 'Option B' });
		await expect(optionB).toBeFocused();

		await page.keyboard.press('ArrowDown');
		await expect(optionC).toBeFocused();

		// Close with escape
		await page.keyboard.press('Escape');
		await expect(menu).not.toBeVisible();
	});
});
