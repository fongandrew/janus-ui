import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('select-typeaheads-demo', (getContainer) => {
	test('can select an option from single typeahead', async ({ page }) => {
		const container = getContainer().getByTestId('single-typeahead-container');
		const singleTypeahead = container.getByTestId('single-typeahead');
		const listBox = container.getByRole('listbox');

		// Check for placeholder
		await expect(container.getByText('Select a color...')).toBeVisible();

		// Type to search
		await singleTypeahead.tap();
		await page.keyboard.press('r');
		await page.keyboard.press('e');
		await expect(listBox).toHaveAttribute('aria-busy', 'true');

		// Wait for async search results
		await expect(listBox).toBeVisible();
		await expect(listBox).toHaveAttribute('aria-busy', 'false');
		await expect(listBox.getByText('Red')).toBeVisible();
		await expect(listBox.getByText('Green')).toBeVisible();

		// Select an option
		await listBox.getByText('Green').tap();

		// Check that selection is applied
		await expect(container.getByText('Selected: green')).toBeVisible();
	});

	test('can select multiple options from typeahead', async ({ page }) => {
		const container = getContainer().getByTestId('multiple-typeahead-container');
		const multiTypeahead = container.getByTestId('multiple-typeahead');
		const comboBox = container.getByRole('combobox');
		const listBox = container.getByRole('listbox');

		// Check for placeholder
		await expect(container.getByText('Select colors...')).toBeVisible();

		// Search for first color
		await multiTypeahead.tap();
		await expect(comboBox).toBeFocused();
		await page.keyboard.press('r');
		await page.keyboard.press('e');

		// Wait for async search results
		await expect(listBox).toBeVisible();
		await expect(listBox.getByText('Red')).toBeVisible();
		await expect(listBox.getByText('Green')).toBeVisible();

		// Select an option
		await listBox.getByText('Green').tap();

		// Search for second color
		await expect(comboBox).toBeFocused();
		await page.keyboard.press('Backspace');
		await page.keyboard.press('Backspace');
		await page.keyboard.press('b');
		await page.keyboard.press('l');
		await expect(listBox.getByText('Blue')).toBeVisible();

		// Select second option
		await listBox.getByText('Blue').tap();

		// Close the dropdown
		await container.getByText('Close').tap();

		// Check that selections are applied
		await expect(container.getByText('2 selected')).toBeVisible();
		await expect(container.getByText('Selected: blue, green')).toBeVisible();

		// Open the dropdown again
		await multiTypeahead.tap();

		// Search for first color
		// No need to backspace -- test that input is blank or text is auto-selected
		await expect(comboBox).toBeFocused();
		await page.keyboard.press('g');
		await page.keyboard.press('r');
		await expect(listBox.getByText('Green')).toBeVisible();
		await listBox.getByText('Green').tap();
		await container.getByText('Close').tap();

		// Close, should be unselected now
		await expect(container.getByText('Blue')).toBeVisible();
		await expect(container.getByText('Selected: blue')).toBeVisible();
	});

	test('keeps multi-select typeahead open after tapping on selection and input', async ({
		page,
	}) => {
		const container = getContainer().getByTestId('multiple-typeahead-container');
		const multiTypeahead = container.getByTestId('multiple-typeahead');
		const typeaheadInput = container.getByRole('combobox');
		const listBox = container.getByRole('listbox');

		// Search for first color
		await multiTypeahead.tap();
		await page.keyboard.press('r');
		await page.keyboard.press('e');

		// Wait for async search results
		await expect(listBox).toBeVisible();
		await listBox.getByText('Green').tap();

		// Tap on the input (to simulate highlighting or something)
		await typeaheadInput.tap();

		// Make sure stuff doesn't disappear after a short delay
		await page.waitForTimeout(240);
		await expect(typeaheadInput).toBeFocused();
		await expect(listBox).toBeVisible();
	});
});
