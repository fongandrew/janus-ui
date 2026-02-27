import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('form-validation-group-demo', (getContainer) => {
	test('validates username in real-time as user types', async () => {
		const container = getContainer();

		// Find username input
		const usernameInput = container.getByLabel('Username');

		// Type a username with a space — error should appear while typing (before blur)
		await usernameInput.pressSequentially('user name');
		await expect(container.getByText('Username cannot contain spaces')).toBeVisible();
		await expect(usernameInput).toHaveAttribute('aria-invalid', 'true');

		// Clear and type a valid username — error should clear in real-time
		await usernameInput.fill('');
		await usernameInput.pressSequentially('username');
		await expect(container.getByText('Username cannot contain spaces')).not.toBeVisible();
		await expect(usernameInput).not.toHaveAttribute('aria-invalid', 'true');

		// Type a reserved name — error should appear in real-time
		await usernameInput.fill('');
		await usernameInput.pressSequentially('root');
		await expect(container.getByText('Username cannot be a reserved name')).toBeVisible();
		await expect(usernameInput).toHaveAttribute('aria-invalid', 'true');

		// Try "admin" as well
		await usernameInput.fill('');
		await usernameInput.pressSequentially('admin');
		await expect(container.getByText('Username cannot be a reserved name')).toBeVisible();
		await expect(usernameInput).toHaveAttribute('aria-invalid', 'true');

		// Fix it
		await usernameInput.fill('');
		await usernameInput.pressSequentially('validuser');
		await expect(container.getByText('Username cannot be a reserved name')).not.toBeVisible();
		await expect(usernameInput).not.toHaveAttribute('aria-invalid', 'true');
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
