import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('checkboxes-demo', (getContainer) => {
	test('renders all checkbox variants with correct states', async () => {
		const container = getContainer();

		// Default checkbox
		const defaultCheckbox = container.getByTestId('default-checkbox');
		await expect(defaultCheckbox).not.toBeChecked();
		await expect(defaultCheckbox).toHaveAttribute('name', 'default');

		// Checked checkbox
		const checkedCheckbox = container.getByTestId('checked-checkbox');
		await expect(checkedCheckbox).toBeChecked();
		await expect(checkedCheckbox).toHaveAttribute('name', 'checked');

		// Indeterminate checkbox
		const indeterminateCheckbox = container.getByTestId('indeterminate-checkbox');
		await expect(indeterminateCheckbox).toHaveAttribute('name', 'indeterminate');
		const isIndeterminate = await indeterminateCheckbox.evaluate(
			(el: HTMLInputElement) => el.indeterminate,
		);
		expect(isIndeterminate).toBeTruthy();

		// Invalid/error checkbox
		const invalidCheckbox = container.getByTestId('invalid-checkbox');
		await expect(invalidCheckbox).toHaveAttribute('aria-invalid', 'true');

		// Disabled checkbox
		const disabledCheckbox = container.getByTestId('disabled-checkbox');
		await expect(disabledCheckbox).toBeDisabled();

		// Long text checkbox
		const longCheckbox = container.getByTestId('long-checkbox');
		await expect(longCheckbox).toBeVisible();

		// Toggle switch
		const toggleSwitch = container.getByTestId('toggle-switch');
		await expect(toggleSwitch).not.toBeChecked();
	});

	test('can toggle by clicking label text', async () => {
		const container = getContainer();

		// Get the default checkbox and its label
		const defaultCheckbox = container.getByTestId('default-checkbox');
		await expect(defaultCheckbox).not.toBeChecked();

		// Click the label text to toggle the checkbox
		await container.getByText('Default checkbox').click();
		await expect(defaultCheckbox).toBeChecked();

		// Click again to toggle back
		await container.getByText('Default checkbox').click();
		await expect(defaultCheckbox).not.toBeChecked();
	});

	test('can toggle by clicking directly on detached checkbox', async () => {
		const container = getContainer();

		// Get the detached checkbox's parent
		const detachedCheckbox = container.getByTestId('detached-checkbox');
		const detachedCheckboxContainer = container.locator(
			'div:has(> [data-testid="detached-checkbox"])',
		);
		await expect(detachedCheckbox).not.toBeChecked();

		// Click directly on the checkbox container (not the label) to toggle on and off
		await detachedCheckboxContainer.click();
		await expect(detachedCheckbox).toBeChecked();

		await detachedCheckboxContainer.click();
		await expect(detachedCheckbox).not.toBeChecked();
	});

	test('can toggle checkboxes with keyboard interaction', async ({ page }) => {
		const container = getContainer();

		// Get the default checkbox
		const defaultCheckbox = container.getByTestId('default-checkbox');
		await expect(defaultCheckbox).not.toBeChecked();

		// Focus the checkbox
		await defaultCheckbox.focus();

		// Press Space to toggle on
		await page.keyboard.press('Space');
		await expect(defaultCheckbox).toBeChecked();

		// Press Space again to toggle off
		await page.keyboard.press('Space');
		await expect(defaultCheckbox).not.toBeChecked();

		// Press Enter to toggle on
		await page.keyboard.press('Enter');
		await expect(defaultCheckbox).toBeChecked();

		// Press Enter again to toggle off
		await page.keyboard.press('Enter');
		await expect(defaultCheckbox).not.toBeChecked();

		// Should focus the toggle switch after tabbing through other elements
		const toggleSwitch = container.getByTestId('toggle-switch');
		await toggleSwitch.focus();

		// Press Space to toggle on
		await page.keyboard.press('Space');
		await expect(toggleSwitch).toBeChecked();

		// Press Space again to toggle off
		await page.keyboard.press('Space');
		await expect(toggleSwitch).not.toBeChecked();

		// Press Enter to toggle on
		await page.keyboard.press('Enter');
		await expect(toggleSwitch).toBeChecked();

		// Press Enter again to toggle off
		await page.keyboard.press('Enter');
		await expect(toggleSwitch).not.toBeChecked();
	});

	test('respects disabled state', async () => {
		const container = getContainer();

		const disabledCheckbox = container.getByTestId('disabled-checkbox');
		await expect(disabledCheckbox).toHaveAttribute('aria-disabled', 'true');
		await expect(disabledCheckbox).not.toBeChecked();

		await container.getByText('Default checkbox').click();
		await expect(disabledCheckbox).not.toBeChecked();
	});
});
