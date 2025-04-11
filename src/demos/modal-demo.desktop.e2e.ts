import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

// Test the controlled modal only on the main page since controlled component
// needs SolidJS framework
describeComponent(['/'], 'modal-demo', (getContainer) => {
	test('controlled modal opens and closes correctly', async ({ page }) => {
		const container = getContainer();
		await expect(container.getByTestId('controlled-modal')).not.toBeVisible();

		// Open the controlled modal
		await container.getByRole('button', { name: 'Controlled Modal' }).click();
		await expect(container.getByTestId('controlled-modal')).toBeVisible();

		// Close using the first close button ('X')
		await container.getByRole('button', { name: 'Close' }).nth(0).click();
		await expect(container.getByTestId('controlled-modal')).not.toBeVisible();

		// Open again
		await container.getByRole('button', { name: 'Controlled Modal' }).click();
		await expect(container.getByTestId('controlled-modal')).toBeVisible();

		// Close using the second close button ('close' button in footer)
		await container.getByRole('button', { name: 'Close' }).nth(1).click();
		await expect(container.getByTestId('controlled-modal')).not.toBeVisible();

		// Open again
		await container.getByRole('button', { name: 'Controlled Modal' }).click();
		await expect(container.getByTestId('controlled-modal')).toBeVisible();

		// Close using the overlay
		await page.mouse.click(1, 1);
		await expect(container.getByTestId('controlled-modal')).not.toBeVisible();

		// Open again
		await container.getByRole('button', { name: 'Controlled Modal' }).click();
		await expect(container.getByTestId('controlled-modal')).toBeVisible();

		// Close with Escape key
		await page.keyboard.press('Escape');
		await expect(container.getByTestId('controlled-modal')).not.toBeVisible();
	});
});

// Test other modals on both main and SSR pages
describeComponent('modal-demo', (getContainer) => {
	test('triggered modal opens and closes correctly', async ({ page }) => {
		const container = getContainer();
		await expect(container.getByTestId('triggered-modal')).not.toBeVisible();

		// Open the triggered modal
		await container.getByRole('button', { name: 'Triggered Modal' }).click();
		await expect(container.getByTestId('triggered-modal')).toBeVisible();

		// Close using the first close button ('X')
		await container.getByRole('button', { name: 'Close' }).nth(0).click();
		await expect(container.getByTestId('triggered-modal')).not.toBeVisible();

		// Open again
		await container.getByRole('button', { name: 'Triggered Modal' }).click();
		await expect(container.getByTestId('triggered-modal')).toBeVisible();

		// Close using the second close button ('close' button in footer)
		await container.getByRole('button', { name: 'Close' }).nth(1).click();
		await expect(container.getByTestId('triggered-modal')).not.toBeVisible();

		// Open again
		await container.getByRole('button', { name: 'Triggered Modal' }).click();
		await expect(container.getByTestId('triggered-modal')).toBeVisible();

		// Close using the overlay
		await page.mouse.click(1, 1);
		await expect(container.getByTestId('triggered-modal')).not.toBeVisible();

		// Open again
		await container.getByRole('button', { name: 'Triggered Modal' }).click();
		await expect(container.getByTestId('triggered-modal')).toBeVisible();

		// Close with Escape key
		await page.keyboard.press('Escape');
		await expect(container.getByTestId('triggered-modal')).not.toBeVisible();
	});

	test('form modal submits data correctly', async () => {
		const container = getContainer();

		// Open the form modal
		await container.getByRole('button', { name: 'Open Modal (Form)' }).click();
		const modal = container.getByTestId('form-modal');
		await expect(modal).toBeVisible();

		// Test we've autofocused the input
		await expect(modal.getByLabel('Name')).toBeFocused();

		// Fill in the form
		await modal.getByLabel('Name').fill('John Doe');
		await modal.getByLabel('Email').fill('john@example.com');
		await modal.getByLabel('Message').fill('This is a test message');

		// Check the checkbox
		await modal.getByText('Agree to the terms of service?').click();

		// Select an option
		await modal.getByLabel('How did you hear about us?').click();
		await modal.getByText('Friends & family').click();

		// Submit the form
		await modal.getByRole('button', { name: 'Submit' }).click();

		// Verify results
		await expect(container.getByText('John Doe')).toBeVisible();
		await expect(container.getByText('john@example.com')).toBeVisible();
		await expect(container.getByText('This is a test message')).toBeVisible();
	});

	test('select escape closes and clears select in popover', async ({ page, browserName }) => {
		const container = getContainer();

		// Open the form modal
		await container.getByRole('button', { name: 'Open Modal (Form)' }).click();
		const modal = container.getByTestId('form-modal');
		await expect(modal).toBeVisible();

		// Select an option -- use keyboard to open to workaorund
		// Safari issues and so we can reliably use focus to test things
		const select = modal.getByLabel('How did you hear about us?');
		await select.focus();
		await page.keyboard.press('Enter');
		await page.keyboard.press('Escape');

		// The modal is hidden after this first escape closes. Stuff is still focused
		// and we can do some interaction but stuff is a bit broken. It works fine
		// when testing manually in Safari though, so something specific to Playwright Webkit.
		test.skip(browserName === 'webkit', 'Webkit bugs out on cancelling modal close');

		await expect(select).toHaveText('Select an option'); // No selection
		await expect(modal).toBeVisible(); // Modal still open
		await expect(modal.getByText('Please confirm')).not.toBeVisible(); // No speedbump

		// Open again and select
		await expect(select).toBeFocused();
		await page.keyboard.press('f');
		await page.keyboard.press('Enter');
		await expect(select).toContainText('Friends & family');
		await expect(modal).toBeVisible(); // Modal still open

		// Clear with escape
		await select.focus();
		await page.keyboard.press('Escape');
		await expect(select).toHaveText('Select an option');
		await expect(modal).toBeVisible(); // Modal still open
		await expect(modal.getByText('Please confirm')).not.toBeVisible(); // No speedbump

		// Pressing escape again shows speed bump
		await page.keyboard.press('Escape');
		await expect(modal.getByText('Please confirm')).toBeVisible();
	});

	test('speedbump prompts for confirmation when closing a form', async () => {
		const container = getContainer();

		// Open the form modal
		await container.getByRole('button', { name: 'Open Modal (Form)' }).click();
		const modal = container.getByTestId('form-modal');
		await expect(modal).toBeVisible();

		// Partially fill in the form
		await modal.getByLabel('Name').fill('John Doe');

		// Close the modal
		await modal.getByRole('button', { name: 'Close' }).nth(0).click();

		// Speedbump should be visible
		await expect(modal.getByText('Please confirm')).toBeVisible();

		// Cancel the speedbump
		await modal.getByRole('button', { name: 'Cancel' }).nth(0).click();
		await expect(modal.getByText('Please confirm')).not.toBeVisible();
		await expect(modal).toBeVisible();
		await expect(modal.getByLabel('Name')).toHaveValue('John Doe');

		// Close the modal again
		await modal.getByRole('button', { name: 'Close' }).nth(0).click();

		// Speedbump should be visible again
		await expect(modal.getByText('Please confirm')).toBeVisible();

		// Confirm the speedbump
		await modal.getByRole('button', { name: 'Close' }).last().click();
		await expect(modal.getByText('Please confirm')).not.toBeVisible();
		await expect(modal).not.toBeVisible();
	});

	test('form modal validates and scrolls to required fields', async () => {
		const container = getContainer();
		await container.getByRole('button', { name: 'Open Form Modal (Scrollable)' }).click();

		// Submit without filling required fields
		const modal = container.getByTestId('scrollable-form-modal');
		await modal.getByRole('button', { name: 'Submit' }).click();

		// Modal should still be open and there should be validation errors
		await expect(modal).toBeVisible();
		await expect(modal.getByRole('alert')).toHaveCount(2);

		const first = modal.getByLabel('First');
		await expect(first).toBeFocused();
		await expect(first).toBeInViewport();

		// Submit again without filling second required field
		await first.fill('First Field Value');
		await modal.getByRole('button', { name: 'Submit' }).click();

		// Fewer validation errors, scrolling to the next required field
		await expect(modal).toBeVisible();
		await expect(modal.getByRole('alert')).toHaveCount(1);

		const second = modal.getByLabel('Last');
		await expect(second).toBeFocused();
		await expect(second).toBeInViewport();

		// Submit again after filling the second field
		await second.fill('Last Field Value');
		await modal.getByRole('button', { name: 'Submit' }).click();
		await expect(modal).not.toBeVisible();
	});

	test('async form submission works correctly', async () => {
		const container = getContainer();
		await container.getByRole('button', { name: 'Open Modal (Async Form)' }).click();

		// Modal should be visible
		const modal = container.getByTestId('async-form-modal');
		await expect(modal).toBeVisible();

		// Fill in the form and check error checkbox
		await modal.getByLabel('Name').fill('Test User');
		await modal.getByLabel('Message').fill('Test message content');
		await modal.getByText('Should error').click();

		// Submit the form
		const submitButton = modal.getByRole('button', { name: 'Submit' });
		await submitButton.click();

		// Button should be disabled during submission
		await expect(submitButton).toHaveAttribute('aria-disabled', 'true');

		// Wait for error message
		await expect(container.getByRole('alert')).toBeVisible({ timeout: 5000 });

		// Uncheck and resubmit
		await modal.getByText('Should error').click();
		await submitButton.click();
		await expect(modal).not.toBeVisible({ timeout: 5000 });

		// Results should be displayed
		const output = container.locator('output');
		await expect(output).toBeVisible();
		const content = await output.textContent();
		expect(content).toContain('Test User');
		expect(content).toContain('Test message content');
	});
});
