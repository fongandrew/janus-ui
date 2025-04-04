import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('list-boxes-demo', (getContainer) => {
	test('renders list boxes with correct initial state', async () => {
		const container = getContainer();

		await expect(container.locator('[name="single-listbox"]:checked')).toHaveCount(0);
		await expect(container.locator('[name="multi-listbox"]:checked')).toHaveCount(0);

		// Check the disabled listbox has the correct initial selected item
		const disabledListboxItem = container.locator('[name="disabled-listbox"]:checked');
		await expect(disabledListboxItem).toHaveAttribute('aria-selected', 'true');
		await expect(disabledListboxItem).toHaveValue('fixed');
	});

	test('allows selecting items in single-selection list box', async () => {
		const container = getContainer();
		const singleListBox = container.getByLabel('Single selection', { exact: true });

		// Select "Apple" option
		await singleListBox.getByText('Apple').click();

		const appleItem = singleListBox.locator('[value="apple"]');
		await expect(appleItem).toBeChecked();
		await expect(appleItem).toHaveAttribute('aria-selected', 'true');
		await expect(container.getByText('Selected: apple')).toBeVisible();

		// Select "Banana" option
		await singleListBox.getByText('Banana').click();

		const bananaItem = singleListBox.locator('[value="banana"]');
		await expect(bananaItem).toBeChecked();
		await expect(bananaItem).toHaveAttribute('aria-selected', 'true');
		await expect(appleItem).not.toBeChecked();
		await expect(appleItem).not.toHaveAttribute('aria-selected', 'true');
		await expect(container.getByText('Selected: banana')).toBeVisible();
	});

	test('allows multiple selections in multi-selection list box', async () => {
		const container = getContainer();
		const multiListBox = container.getByLabel('Multiple selection', { exact: true });

		// Initially nothing should be selected
		await expect(multiListBox.locator('[aria-selected="true"]')).toHaveCount(0);

		// Select "green" option
		await multiListBox.getByText('Green').click();

		const greenItem = multiListBox.locator('[value="green"]');
		await expect(greenItem).toBeChecked();
		await expect(greenItem).toHaveAttribute('aria-selected', 'true');
		await expect(container.getByText('Selected: green')).toBeVisible();

		// Select "blue" option
		await multiListBox.getByText('Blue').click();

		const blueItem = multiListBox.locator('[value="blue"]');
		await expect(blueItem).toBeChecked();
		await expect(blueItem).toHaveAttribute('aria-selected', 'true');
		await expect(greenItem).toBeChecked();
		await expect(greenItem).toHaveAttribute('aria-selected', 'true');
		await expect(container.getByText(/^Selected: (green, blue|blue, green)$/)).toBeVisible();

		// Unselect "green" option
		await multiListBox.getByText('Green').click();
		await expect(blueItem).toBeChecked();
		await expect(blueItem).toHaveAttribute('aria-selected', 'true');
		await expect(greenItem).not.toBeChecked();
		await expect(greenItem).not.toHaveAttribute('aria-selected', 'true');
		await expect(container.getByText('Selected: blue')).toBeVisible();
	});

	test('handles single-selection keyboard interaction', async ({ page }) => {
		const container = getContainer();
		const singleListBox = container.getByLabel('Single selection', { exact: true });

		// Click label to focus the list box
		await container.getByText('Single selection', { exact: true }).click();
		await expect(singleListBox).toBeFocused();

		// Press down arrow to select the first item
		await page.keyboard.press('ArrowDown');
		await expect(singleListBox.locator(':checked')).toHaveValue('apple');
		await expect(singleListBox.locator('[aria-selected="true"]')).toHaveValue('apple');
		await expect(container.getByText('Selected: apple')).toBeVisible();

		// Press down arrow to select the second item
		await page.keyboard.press('ArrowDown');
		await expect(singleListBox.locator(':checked')).toHaveValue('banana');
		await expect(singleListBox.locator('[aria-selected="true"]')).toHaveValue('banana');
		await expect(container.getByText('Selected: banana')).toBeVisible();

		// And back up to the first item
		await page.keyboard.press('ArrowUp');
		await expect(singleListBox.locator(':checked')).toHaveValue('apple');
		await expect(singleListBox.locator('[aria-selected="true"]')).toHaveValue('apple');
		await expect(container.getByText('Selected: apple')).toBeVisible();
	});

	test('handles multi-selection keyboard interaction', async ({ page }) => {
		const container = getContainer();
		const multiListBox = container.getByLabel('Multiple selection', { exact: true });

		// Click label to focus the list box
		await container.getByText('Multiple selection', { exact: true }).click();
		await expect(multiListBox).toBeFocused();

		// Press down arrow to highlight the first item but not check it
		await page.keyboard.press('ArrowDown');
		await expect(multiListBox.locator(':checked')).toHaveCount(0);

		// Press space to select / unselect
		await page.keyboard.press('Space');
		await expect(multiListBox.locator(':checked')).toHaveCount(1);
		await page.keyboard.press('Space');
		await expect(multiListBox.locator(':checked')).toHaveCount(0);

		// Press enter to select / unselect
		await page.keyboard.press('Enter');
		await expect(multiListBox.locator(':checked')).toHaveCount(1);
		await page.keyboard.press('Enter');
		await expect(multiListBox.locator(':checked')).toHaveCount(0);

		// Select multiple
		await page.keyboard.press('Enter');
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');
		await expect(multiListBox.locator(':checked')).toHaveCount(2);
	});

	test('validates selection', async () => {
		const container = getContainer();
		const multiListBox = container.getByLabel('Multiple selection', { exact: true });

		// Pick forbidden item "Red"
		await multiListBox.getByText('Red').click();
		await expect(multiListBox).toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByText("Don't pick red.")).toBeVisible();

		// Unpick it
		await multiListBox.getByText('Red').click();
		await expect(multiListBox).not.toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByText("Don't pick red.")).not.toBeVisible();
	});

	test('disabled list box can be focused but not changed', async ({ page }) => {
		const container = getContainer();
		const disabledListBox = container.getByLabel('Disabled selection', { exact: true });
		await expect(disabledListBox).toHaveAttribute('aria-disabled', 'true');

		disabledListBox.focus();
		await expect(disabledListBox).toBeFocused();
		await page.keyboard.press('ArrowDown');
		await page.keyboard.press('Enter');
		await expect(disabledListBox.locator('[aria-selected="true"]')).toHaveValue('fixed');
	});
});
