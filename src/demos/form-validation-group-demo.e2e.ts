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

	test('validates password confirmation', async () => {
		const container = getContainer();

		// Find password inputs
		const passwordInput = container.getByLabel('Password', { exact: true });
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
