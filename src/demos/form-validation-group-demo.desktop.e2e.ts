import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('form-validation-group-demo', (getContainer) => {
	test('validates username input (no spaces)', async () => {
		const container = getContainer();

		// Find username input
		const usernameInput = container.getByLabel('Username');

		// Input invalid username with space
		await usernameInput.fill('user name');
		await usernameInput.blur();

		// Check for error message
		await expect(container.getByText('Username cannot contain spaces')).toBeVisible();
		await expect(usernameInput).toHaveAttribute('aria-invalid', 'true');

		// Fix the username value
		await usernameInput.fill('username');
		await usernameInput.blur();

		// Error should be cleared
		await expect(container.getByText('Username cannot contain spaces')).not.toBeVisible();
		await expect(usernameInput).not.toHaveAttribute('aria-invalid', 'true');
	});

	test('validates email input in real-time as user types', async () => {
		const container = getContainer();

		// Find email input
		const emailInput = container.getByLabel('Email');

		// Type an incomplete email — error should appear while typing (before blur)
		await emailInput.pressSequentially('notanemail');
		await expect(container.getByText('Please enter a valid email address')).toBeVisible();
		await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

		// Continue typing to make it valid — error should clear in real-time
		await emailInput.pressSequentially('@example.com');
		await expect(container.getByText('Please enter a valid email address')).not.toBeVisible();
		await expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');

		// Clear and type another invalid value — should show error again
		await emailInput.fill('');
		await emailInput.pressSequentially('bad@');
		await expect(container.getByText('Please enter a valid email address')).toBeVisible();
		await expect(emailInput).toHaveAttribute('aria-invalid', 'true');

		// Fix it
		await emailInput.pressSequentially('test.com');
		await expect(container.getByText('Please enter a valid email address')).not.toBeVisible();
		await expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
	});

	test('validates password confirmation', async () => {
		const container = getContainer();

		// Find password inputs
		// "Password" matches "Confirm Password" too so use regex to force match on start
		const passwordInput = container.getByLabel(/^Password/);
		const confirmPasswordInput = container.getByLabel('Confirm Password');

		// Input first password
		await passwordInput.fill('password123');

		// Confirm this doesn't immediately trigger validation error
		await expect(container.getByText('Passwords do not match')).not.toBeVisible();
		await expect(confirmPasswordInput).not.toHaveAttribute('aria-invalid', 'true');

		// Input non-matching password for confirmation
		await confirmPasswordInput.fill('password456');
		await confirmPasswordInput.blur();

		// Check for error message
		await expect(container.getByText('Passwords do not match')).toBeVisible();
		await expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');

		// Fix the confirm password value
		await confirmPasswordInput.fill('password123');
		await confirmPasswordInput.blur();

		// Error should be cleared
		await expect(container.getByText('Passwords do not match')).not.toBeVisible();
		await expect(confirmPasswordInput).not.toHaveAttribute('aria-invalid', 'true');
	});
});
