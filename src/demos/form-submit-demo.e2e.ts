import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('form-submit-demo', (getContainer) => {
	test('submits async form and displays the submitted data', async () => {
		const container = getContainer();

		// Fill in the form
		await container.getByTestId('name-input').fill('Test User');
		await container.getByTestId('message-textarea').fill('This is a test message');

		// Submit the form
		const submitButton = container.getByTestId('submit-button');
		await submitButton.click();

		// Submit button is dsiabled while the form is busy
		await expect(submitButton).toHaveAttribute('aria-disabled', 'true');

		// Wait for the submitted data to be displayed (after the artificial delay)
		const output = container.locator('output');
		await expect(output).toBeVisible({ timeout: 5000 });

		const content = await output.textContent();
		expect(content).toMatch(/Test User/);
		expect(content).toMatch(/This is a test message/);

		// Form should no longer be busy
		await expect(submitButton).not.toHaveAttribute('aria-disabled', 'true');
	});

	test('resets form fields when reset button is clicked', async () => {
		const container = getContainer();

		// Fill in the form
		await container.getByTestId('name-input').fill('Test User');
		await container.getByTestId('message-textarea').fill('This is a test message');

		// Verify inputs have values
		await expect(container.getByTestId('name-input')).toHaveValue('Test User');
		await expect(container.getByTestId('message-textarea')).toHaveValue(
			'This is a test message',
		);

		// Click reset button
		await container.getByTestId('reset-button').click();

		// Verify inputs are cleared
		await expect(container.getByTestId('name-input')).toHaveValue('');
		await expect(container.getByTestId('message-textarea')).toHaveValue('');
	});

	test('shows error message when error checkbox is checked', async () => {
		const container = getContainer();

		// Fill in the form and check the error checkbox
		await container.getByTestId('name-input').fill('Test User');
		await container.getByTestId('message-textarea').fill('This is a test message');
		await container.getByText('Force error').click();

		// Submit the form
		await container.getByTestId('submit-button').click();

		// Wait for the error message to appear
		await expect(container.getByRole('alert')).toBeVisible({ timeout: 5000 });
		await expect(container.getByRole('alert')).toContainText('Form submission failed');

		// The submitted data should not be displayed
		await expect(container.locator('output')).not.toBeVisible();
	});

	test('validates form fields correctly', async ({ page }) => {
		const container = getContainer();

		// Try submitting the async form without any input
		await container.getByTestId('submit-button').click();

		// Wait for validation messages to appear
		const nameDescribedById = await container
			.getByTestId('name-input')
			.getAttribute('aria-describedby');
		const nameError = container.locator(`[role="alert"][id="${nameDescribedById}"]`);
		await expect(nameError).toBeVisible({ timeout: 5000 });

		const messageDescribedById = await container
			.getByTestId('message-textarea')
			.getAttribute('aria-describedby');
		const messageError = container.locator(`[role="alert"][id="${messageDescribedById}"]`);
		await expect(messageError).toBeVisible({ timeout: 5000 });

		// Fill in fields and submit again
		await container.getByTestId('name-input').fill('Bob');
		await container.getByTestId('message-textarea').fill('Hello, this is Bob');

		// Sort of dumb but clicking submit button immediately fails because the mousedown
		// blurs the input and shifts the location of the submit button which then makes
		// the mouseup miss. So first tab to trigger the blur and validation clear.
		await page.keyboard.press('Tab');
		await container.getByTestId('submit-button').click();

		// Field level error
		await expect(container.getByText('We already have a Bob')).toBeVisible({ timeout: 5000 });
	});
});
