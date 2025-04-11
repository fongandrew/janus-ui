import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('selects-demo', (getContainer) => {
	test('can select an option from single select dropdown via mouse', async () => {
		const container = getContainer().getByTestId('single-selection-container');

		// Single selection - test visible placeholder
		const singleSelect = container.getByTestId('single-selection');
		await expect(singleSelect.getByText('Select a fruit...')).toBeVisible();

		// Click to open dropdown
		await singleSelect.click();
		const listbox = container.getByRole('listbox');
		await expect(listbox).toBeVisible();

		// Select an option
		await listbox.getByText('Apple').click();

		// Dropdown is hidden
		await expect(listbox).not.toBeVisible();

		// Placeholder is swapped, signal-connected description updates
		await expect(singleSelect.getByText('Select a fruit...')).not.toBeVisible();
		await expect(singleSelect.getByText('Apple')).toBeVisible();
		await expect(container.getByText('Selected: apple')).toBeVisible();
	});

	test('can open select by clicking label', async () => {
		const container = getContainer().getByTestId('single-selection-container');
		const label = container.getByText('Single selection');

		await label.click();
		const listbox = container.getByRole('listbox');
		await expect(listbox).toBeVisible();
	});

	test('can select an option from single select dropdown via keyboard', async ({ page }) => {
		const container = getContainer().getByTestId('single-selection-container');
		const singleSelect = container.getByTestId('single-selection');
		await singleSelect.focus();

		// Open dropdown
		await page.keyboard.press('Enter');
		const listbox = container.getByRole('listbox');
		await expect(listbox).toBeVisible();

		// Selecting via arrow auto-selects
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Escape');
		await expect(listbox).not.toBeVisible();
		await expect(container.getByText('Selected: banana')).toBeVisible();

		// Open via arrow key this time
		await page.keyboard.press('ArrowDown');
		await expect(listbox).toBeVisible();

		// Select by typing
		await page.keyboard.press('o');
		await page.keyboard.press('Escape');
		await expect(listbox).not.toBeVisible();
		await expect(container.getByText('Selected: orange')).toBeVisible();
	});

	test('can select an option from multiple select dropdown', async ({ page }) => {
		const container = getContainer().getByTestId('multiple-selection-container');

		// Multi select - test visible placeholder
		const multiSelect = container.getByTestId('multiple-selection');
		await expect(multiSelect.getByText('Select colors...')).toBeVisible();

		// Click to open dropdown
		await multiSelect.click();
		const listbox = container.getByRole('listbox');
		await expect(listbox).toBeVisible();

		// Select an option
		await listbox.getByText('Green').click();
		await listbox.getByText('Blue').click();
		await page.keyboard.press('Escape');

		// Dropdown is hidden
		await expect(listbox).not.toBeVisible();

		// Placeholder is swapped, signal-connected description updates
		await expect(multiSelect.getByText('Select colors...')).not.toBeVisible();
		await expect(multiSelect.getByText('2 selected')).toBeVisible();
		await expect(container.getByText('Selected: green, blue')).toBeVisible();
	});

	test('can select an option from multi select dropdown via keyboard', async ({ page }) => {
		const container = getContainer().getByTestId('multiple-selection-container');
		const multiSelect = container.getByTestId('multiple-selection');
		await multiSelect.focus();

		// Open dropdown (use arrow to auto-select last)
		await page.keyboard.press('ArrowUp');
		const listbox = container.getByRole('listbox');
		await expect(listbox).toBeVisible();

		// Selecting via arrow auto-selects
		await page.keyboard.press('Enter');
		await page.keyboard.press('Escape');
		await expect(listbox).not.toBeVisible();
		await expect(container.getByText('Selected: blue')).toBeVisible();

		// Open via space key this time
		await page.keyboard.press(' ');
		await expect(listbox).toBeVisible();

		// Select by typing
		await page.keyboard.press('g');
		await page.keyboard.press('Enter');
		await page.keyboard.press('Escape');
		await expect(listbox).not.toBeVisible();
		await expect(container.getByText('Selected: green, blue')).toBeVisible();
	});

	test('renders initially selected option in placeholder', async () => {
		const container = getContainer();
		const initialValueSelect = container.getByTestId('initial-value-selection');
		await expect(initialValueSelect.getByText('Banana')).toBeVisible();
	});

	test('can clear selection with Escape key', async ({ page }) => {
		const container = getContainer().getByTestId('single-selection-container');
		const singleSelect = container.getByTestId('single-selection');
		await singleSelect.focus();
		await page.keyboard.press('Enter');
		await page.keyboard.press('b');
		await page.keyboard.press('Escape');
		await expect(singleSelect.getByText('Banana')).toBeVisible();

		// Test clearing selection with escape
		await singleSelect.focus();
		await page.keyboard.press('Escape');
		await expect(singleSelect.getByText('Select a fruit...')).toBeVisible();

		// Test re-opening modal doesn't reselect
		await page.keyboard.press('Enter');
		await page.keyboard.press('Escape');
		await page.waitForTimeout(100);
		await expect(singleSelect.getByText('Select a fruit...')).toBeVisible();
	});

	test('shows error when selecting invalid option', async () => {
		const container = getContainer().getByTestId('multiple-selection-container');

		// Click to open dropdown
		const multiSelect = container.getByTestId('multiple-selection');
		await multiSelect.click();
		const listbox = container.getByRole('listbox');
		await expect(listbox).toBeVisible();

		// Select the invalid option
		await listbox.getByText('Red').click();

		// Error message should be visible
		await expect(container.getByText("Don't pick red.")).toBeVisible();

		// Select should have invalid attribute
		await expect(listbox).toHaveAttribute('aria-invalid', 'true');
	});

	test('respects disabled state', async () => {
		const container = getContainer().getByTestId('disabled-selection-container');

		// Can't open by clicking
		const disabledSelect = container.getByTestId('disabled-selection');
		await disabledSelect.click({ force: true });
		await expect(container.getByRole('listbox')).not.toBeVisible();

		// Can't open with keyboard
		await disabledSelect.focus();
		await disabledSelect.press('Enter');
		await expect(container.getByRole('listbox')).not.toBeVisible();
	});

	test('can open long selection list and scroll', async ({ page }) => {
		const container = getContainer().getByTestId('long-selection-container');
		const longSelect = container.getByTestId('long-selection');
		const listbox = container.getByRole('listbox');

		// Click to open dropdown
		await longSelect.click();
		await expect(listbox).toBeVisible();

		// Arrow up to jump to end
		await page.keyboard.press('ArrowUp');

		// Last item should be visible
		await expect(listbox.getByText('Option 99')).toBeInViewport();
		await expect(listbox.locator('[value="99"]')).toHaveAttribute('data-c-option-list__active');
	});
});
