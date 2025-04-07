import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('radio-groups-demo', (getContainer) => {
	test('can select radio by clicking label text', async () => {
		const container = getContainer();
		const output = container.locator('output');

		// Initially "checked" radio is selected
		await expect(output).toContainText('Selected: checked');

		// Click the "First radio" label to select it
		await container.getByText('First radio').click();

		// Output should update to show the new selection
		await expect(output).toContainText('Selected: first');

		// The default radio should now be checked
		const firstRadio = container.getByRole('radio', { name: 'First radio' });
		await expect(firstRadio).toBeChecked();

		// And the previously checked radio should be unchecked
		const checkedRadio = container.getByRole('radio', { name: 'Checked radio' });
		await expect(checkedRadio).not.toBeChecked();
	});

	test('can select radios with keyboard interaction', async ({ page }) => {
		const container = getContainer();
		const output = container.locator('output');
		await expect(output).toContainText('Selected: checked');

		// Focus the initially selected radio
		const checkedRadio = container.locator('input:checked');
		await checkedRadio.focus();

		// Arrows should change selected radio
		await page.keyboard.press('ArrowDown');
		const errorRadio = container.locator('[value="error"]');
		await expect(errorRadio).toBeFocused();
		await expect(errorRadio).toBeChecked();
		await expect(output).toContainText('Selected: error');

		await page.keyboard.press('ArrowDown');
		const disabledRadio = container.locator('[value="disabled"]');
		await expect(disabledRadio).toBeFocused();
		await expect(disabledRadio).not.toBeChecked();
		await expect(output).toContainText('Selected: error');

		await page.keyboard.press('ArrowDown');
		const longRadio = container.locator('[value="long"]');
		await expect(longRadio).toBeFocused();
		await expect(longRadio).toBeChecked();
		await expect(output).toContainText('Selected: long');

		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('ArrowUp');
		await expect(checkedRadio).toBeFocused();
		await expect(checkedRadio).toBeChecked();
		await expect(longRadio).not.toBeChecked();
		await expect(disabledRadio).not.toBeChecked();
		await expect(errorRadio).not.toBeChecked();
		await expect(output).toContainText('Selected: checked');

		// Can select with space too
		const radioA = container.locator('input[value="a"]');
		await radioA.focus();
		await page.keyboard.press('Space');
		await expect(radioA).toBeChecked();
	});
});
