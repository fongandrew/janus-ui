import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

// CSR tests
describeComponent(['/'], 'error-fallback-demo', (getContainer) => {
	test('shows error fallback on section error', async () => {
		const container = getContainer();

		// Click the section error button to trigger an error
		await container.getByTestId('section-error-button').click();

		// Error fallback should be displayed
		await expect(container.getByText('Something went wrong')).toBeVisible();
		await expect(container.getByText(/Reloading the page might fix this issue/)).toBeVisible();

		// Error details should be displayed (error code and event ID)
		await expect(container.getByText(/Error code:/)).toBeVisible();
		await expect(container.getByText(/Event ID:/)).toBeVisible();

		// Support link should be present
		const supportLink = container.getByRole('link', { name: 'Contact support' });
		await expect(supportLink).toBeVisible();
		await expect(supportLink).toHaveAttribute('href', 'https://example.com/support');

		// Test reload functionality - clicking should recover the component
		const reloadButton = container.getByRole('button', { name: 'Reload' });
		await reloadButton.click();

		// After clicking reload, the error fallback should be gone,
		// and the section should be back to normal
		await expect(container.getByTestId('section-error-button')).toBeVisible();
		await expect(container.getByText('Something went wrong')).not.toBeVisible();
	});

	test('displays modal error fallback when modal error button is clicked', async ({ page }) => {
		const container = getContainer();
		const modal = container.getByRole('dialog');
		await expect(modal).not.toBeVisible();

		// Click the modal error button to trigger an error in modal
		await container.getByTestId('modal-error-button').click();
		await expect(modal).toBeVisible();

		// Should be able to close the modal
		await page.keyboard.press('Escape');
		await expect(modal).not.toBeVisible();
	});
});

// SSR -- should just expect the error fallback to be visible
describeComponent(['/ssr'], 'error-fallback-demo', (getContainer) => {
	test('shows error fallback on section error', async () => {
		const container = getContainer();

		// Error fallback should be displayed
		await expect(container.getByText('Something went wrong')).toBeVisible();
		await expect(container.getByText(/Reloading the page might fix this issue/)).toBeVisible();

		// Error details should be displayed (error code and event ID)
		await expect(container.getByText(/Error code:/)).toBeVisible();
		await expect(container.getByText(/Event ID:/)).toBeVisible();

		// Support link should be present
		const supportLink = container.getByRole('link', { name: 'Contact support' });
		await expect(supportLink).toBeVisible();
		await expect(supportLink).toHaveAttribute('href', 'https://example.com/support');
	});
});
