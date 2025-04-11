import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('select-typeaheads-demo', (getContainer) => {
	test('can select an option from single typeahead via mouse', async ({ page }) => {
		const container = getContainer().getByTestId('single-typeahead-container');
		const singleTypeahead = container.getByTestId('single-typeahead');
		const listBox = container.getByRole('listbox');

		// Check for placeholder
		await expect(container.getByText('Select a color...')).toBeVisible();

		// Type to search
		await singleTypeahead.click();
		await page.keyboard.press('r');
		await page.keyboard.press('e');
		await expect(listBox).toHaveAttribute('aria-busy', 'true');

		// Wait for async search results
		await expect(listBox).toBeVisible();
		await expect(listBox).toHaveAttribute('aria-busy', 'false');
		await expect(listBox.getByText('Red')).toBeVisible();
		await expect(listBox.getByText('Green')).toBeVisible();

		// Select an option
		await listBox.getByText('Green').click();

		// Check that selection is applied
		await expect(container.getByText('Selected: green')).toBeVisible();
	});

	test('can select an option from single typeahead via keyboard', async ({ page }) => {
		const container = getContainer().getByTestId('single-typeahead-container');
		const singleTypeahead = container.getByTestId('single-typeahead');
		await singleTypeahead.focus();
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('e');

		// Should trigger async search
		const listBox = container.getByRole('listbox');
		await expect(listBox).toBeVisible();
		await expect(listBox.locator('[value="red"]')).toHaveAttribute(
			'data-c-option-list__active',
		);

		// Arrow keys to change selection
		await page.keyboard.press('ArrowDown');
		await expect(listBox.locator('[value="orange"]')).toHaveAttribute(
			'data-c-option-list__active',
		);
		await page.keyboard.press('ArrowDown');
		await expect(listBox.locator('[value="yellow"]')).toHaveAttribute(
			'data-c-option-list__active',
		);
		await page.keyboard.press('ArrowUp');
		await page.keyboard.press('Enter');

		// Check that selection is applied
		await expect(listBox).not.toBeVisible();
		await expect(container.getByText('Selected: orange')).toBeVisible();
	});

	test('automatically opens typeahead when typing and selects when closing', async ({ page }) => {
		const container = getContainer().getByTestId('single-typeahead-container');
		const singleTypeahead = container.getByTestId('single-typeahead');

		await singleTypeahead.focus();
		await page.keyboard.press('g');
		const listBox = container.getByRole('listbox');
		await expect(listBox).toBeVisible();

		await page.keyboard.press('r');
		await expect(listBox.getByText('Green')).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(listBox).not.toBeVisible();
		await expect(container.getByText('Selected: green')).toBeVisible();
	});

	test('automatically selects and closes typeahead when tabbing', async ({ page }) => {
		const container = getContainer().getByTestId('single-typeahead-container');
		const singleTypeahead = container.getByTestId('single-typeahead');
		await singleTypeahead.focus();
		await page.keyboard.press('r');

		const listBox = container.getByRole('listbox');
		await expect(listBox.getByText('Red')).toBeVisible();

		await page.keyboard.press('Tab');
		await expect(listBox).not.toBeVisible();
		await expect(container.getByText('Selected: red')).toBeVisible();
	});

	test('can select multiple options from typeahead', async ({ page }) => {
		const container = getContainer().getByTestId('multiple-typeahead-container');
		const multiTypeahead = container.getByTestId('multiple-typeahead');
		const typeaheadInput = container.getByRole('combobox');
		const listBox = container.getByRole('listbox');

		// Check for placeholder
		await expect(container.getByText('Select colors...')).toBeVisible();

		// Search for first color
		await multiTypeahead.click();
		await page.keyboard.press('r');
		await page.keyboard.press('e');

		// Wait for async search results
		await expect(listBox).toBeVisible();
		await expect(listBox.getByText('Red')).toBeVisible();
		await expect(listBox.getByText('Green')).toBeVisible();

		// Select an option
		await listBox.getByText('Green').click();

		// Search for second color
		await expect(typeaheadInput).toBeFocused();
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('b');
		await page.keyboard.press('l');
		await expect(listBox.getByText('Blue')).toBeVisible();

		// Select second option
		await listBox.getByText('Blue').click();

		// Close the dropdown
		await page.keyboard.press('Escape');

		// Check that selections are applied
		await expect(container.getByText('2 selected')).toBeVisible();
		await expect(container.getByText('Selected: blue, green')).toBeVisible();

		// Open the dropdown again -- for reasons unclear, clicking the typeahead
		// again doesn't reliably open it on Safari (although it seems to work when
		// testing live?). So just focus and press enter to open it.
		await multiTypeahead.focus();
		await page.keyboard.press('Enter');

		// Search for color to unselect
		// No need to backspace -- test that input is blank or text is auto-selected
		await expect(typeaheadInput).toBeFocused();
		await page.keyboard.press('g');
		await page.keyboard.press('r');
		await expect(listBox.getByText('Green')).toBeVisible();
		await listBox.getByText('Green').click();

		// Close, should be unselected now
		await expect(container.getByText('Blue')).toBeVisible();
		await expect(container.getByText('Selected: blue')).toBeVisible();
	});

	test('shows error when selecting invalid option', async ({ page }) => {
		const container = getContainer().getByTestId('multiple-typeahead-container');
		const multiTypeahead = container.getByTestId('multiple-typeahead');
		const typeaheadInput = container.getByRole('combobox');
		const listBox = container.getByRole('listbox');

		// Click to open dropdown
		await multiTypeahead.click();
		await page.keyboard.press('r');
		await expect(listBox).toBeVisible();

		// Select the invalid option
		await listBox.getByText('Red').click();

		// Error message should be visible
		await expect(container.getByText("Don't pick red.")).toBeVisible();

		// Select should have invalid attribute
		await expect(typeaheadInput).toHaveAttribute('aria-invalid', 'true');
	});

	test('respects disabled state', async ({ page }) => {
		const container = getContainer().getByTestId('disabled-typeahead-container');
		const disabledTypeahead = container.getByTestId('disabled-typeahead');
		await expect(disabledTypeahead).toHaveAttribute('aria-disabled', 'true');

		// Verify it can't be opened
		await disabledTypeahead.focus();
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('r');

		const listBox = container.getByRole('listbox');
		await page.waitForTimeout(250);
		await expect(listBox).not.toBeVisible();
	});

	test('renders initially selected values correctly', async () => {
		const container = getContainer().getByTestId('initial-selection-typeahead-container');

		// Check that initial values are displayed in description
		await expect(container.getByText('2 selected')).toBeVisible();
	});
});
