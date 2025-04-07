import { expect, test } from '@playwright/test';

import { describeComponent } from '~/demos/test-utils/demo-e2e-helpers';

describeComponent('alerts-demo', (getContainer) => {
	test('renders all alert types initially hidden', async () => {
		const container = getContainer();

		// All alert containers should exist but not be visible
		await expect(container.getByTestId('info-alert-container')).not.toBeVisible();
		await expect(container.getByTestId('callout-container')).not.toBeVisible();
		await expect(container.getByTestId('success-alert-container')).not.toBeVisible();
		await expect(container.getByTestId('warning-alert-container')).not.toBeVisible();
		await expect(container.getByTestId('danger-alert-container')).not.toBeVisible();
	});

	test('toggles info alert visibility when button is clicked', async () => {
		const container = getContainer();
		const toggleButton = container.getByTestId('toggle-info-button');
		const alertContainer = container.getByTestId('info-alert-container');

		// Initially hidden
		await expect(alertContainer).toHaveClass(/t-hidden/);
		await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

		// Click to show
		await toggleButton.click();
		await expect(alertContainer).not.toHaveClass(/t-hidden/);
		await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

		// Click to hide
		await toggleButton.click();
		await expect(alertContainer).toHaveClass(/t-hidden/);
		await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
	});

	test('verifies ARIA roles and attributes for different alert types', async () => {
		const container = getContainer();

		await container.getByTestId('toggle-info-button').click();
		const infoAlert = container.getByTestId('info-alert');
		await expect(infoAlert).toHaveAttribute('role', 'alert');
		await expect(infoAlert).toHaveAttribute('aria-live', 'polite');

		await container.getByTestId('toggle-callout-button').click();
		const callout = container.getByTestId('callout');
		await expect(callout).toHaveAttribute('role', 'note');
		await expect(callout).toHaveAttribute('aria-live', 'off');

		await container.getByTestId('toggle-success-button').click();
		const successAlert = container.getByTestId('success-alert');
		await expect(successAlert).toHaveAttribute('role', 'alert');
		await expect(successAlert).toHaveAttribute('aria-live', 'assertive');

		await container.getByTestId('toggle-warning-button').click();
		const warningAlert = container.getByTestId('warning-alert');
		await expect(warningAlert).toHaveAttribute('role', 'alert');
		await expect(warningAlert).toHaveAttribute('aria-live', 'assertive');

		await container.getByTestId('toggle-danger-button').click();
		const dangerAlert = container.getByTestId('danger-alert');
		await expect(dangerAlert).toHaveAttribute('role', 'alert');
		await expect(dangerAlert).toHaveAttribute('aria-live', 'assertive');
	});
});
