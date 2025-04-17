import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('selection-validation-demo', (getContainer) => {
	test('runs custom validation on change', async () => {
		const container = getContainer();
		const fruitsListBox = container.getByLabel('Select Fruits');

		// Select only one item (should show validation error)
		await fruitsListBox.getByText('Apple').click();

		// Error message should appear
		await expect(fruitsListBox).toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByText('Select at least 2 options')).toBeVisible();

		// Select second item (should now pass validation)
		await fruitsListBox.getByText('Banana').click();
		await expect(fruitsListBox).not.toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByText('Select at least 2 options')).not.toBeVisible();

		// Select again to trigger error
		await fruitsListBox.getByText('Orange').click();
		await fruitsListBox.getByText('Grape').click();
		await expect(fruitsListBox).toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByText('Select at most 3 options')).toBeVisible();
	});

	test('validates on submit', async ({ page }) => {
		const container = getContainer();

		// Submit the form without selecting any values
		await container.getByRole('button', { name: 'Submit' }).click();

		// Check that we have four components with validation errors
		await expect(container.getByRole('alert').filter({ visible: true })).toHaveCount(4);

		// Select valid number of fruits (2-3)
		const fruitsListBox = container.getByLabel('Select Fruits');
		await fruitsListBox.getByText('Apple').click();
		await fruitsListBox.getByText('Banana').click();

		// Select at least 1 animal
		const animalsListBox = container.getByLabel('Select Animal');
		await animalsListBox.getByText('Dog').click();

		// Select valid number of colors (2-3)
		const colorsSelect = container.getByLabel('Select Colors');
		await colorsSelect.click();
		const colorsListBox = container.getByRole('listbox');
		await colorsListBox.getByText('Red').click();
		await colorsListBox.getByText('Blue').click();
		await page.mouse.click(0, 0); // Close select

		// Select a city
		// Use keyboard to open the select to workaround Safari issue where we can't
		// seem to click things after closing a select
		const citiesSelect = container.getByLabel('Select City');
		await citiesSelect.focus();
		await page.keyboard.press('Enter');
		const citiesListBox = container.getByRole('listbox');
		await citiesListBox.getByText('Boston').click();

		// Submit the form
		const submit = container.getByRole('button', { name: 'Submit' });
		await submit.focus();
		await page.keyboard.press('Enter');

		// Check that form data is displayed correctly
		await expect(container.getByRole('alert').filter({ visible: true })).toHaveCount(0);
		const output = container.locator('output');
		await expect(output).toBeVisible();
		const outputText = await output.textContent();
		expect(outputText).toContain('apple');
		expect(outputText).toContain('banana');
		expect(outputText).toContain('red');
		expect(outputText).toContain('blue');
		expect(outputText).toContain('dog');
		expect(outputText).toContain('boston');
	});

	test('can reset form selections', async () => {
		const container = getContainer();

		// Make some selections
		const fruitsListBox = container.getByLabel('Select Fruits');
		await fruitsListBox.getByText('Apple').click();

		// Check stuff is selected and there's an error
		await expect(fruitsListBox.locator('[name="fruits"]:checked')).toHaveCount(1);
		await expect(fruitsListBox).toHaveAttribute('aria-invalid', 'true');
		await expect(container.getByText('Select at least 2 options')).toBeVisible();

		// Reset the form
		await container.getByRole('button', { name: 'Reset' }).click();

		// Check that selections and errors are cleared
		await expect(container.locator('[name="fruits"]:checked')).toHaveCount(0);
		await expect(fruitsListBox).toHaveAttribute('aria-invalid', 'false');
		await expect(container.getByText('Select at least 2 options')).not.toBeVisible();
	});
});
