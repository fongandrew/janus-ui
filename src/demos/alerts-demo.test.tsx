import { fireEvent, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { renderImport } from '~/shared/utility/test-utils/render';

const render = () => renderImport('~/demos/alerts-demo', 'AlertsDemo');

describe('AlertsDemo', () => {
	it('renders all alert types hidden initially', async () => {
		await render();

		// All alerts should exist but be hidden initially
		const infoAlertContainer = screen.getByTestId('info-alert-container');
		const calloutContainer = screen.getByTestId('callout-container');
		const successAlertContainer = screen.getByTestId('success-alert-container');
		const warningAlertContainer = screen.getByTestId('warning-alert-container');
		const dangerAlertContainer = screen.getByTestId('danger-alert-container');

		expect(infoAlertContainer).toHaveClass('t-hidden');
		expect(calloutContainer).toHaveClass('t-hidden');
		expect(successAlertContainer).toHaveClass('t-hidden');
		expect(warningAlertContainer).toHaveClass('t-hidden');
		expect(dangerAlertContainer).toHaveClass('t-hidden');
	});

	it('toggles info alert visibility when button is clicked', async () => {
		await render();

		const toggleButton = screen.getByTestId('toggle-info-button');
		const infoAlertContainer = screen.getByTestId('info-alert-container');

		expect(infoAlertContainer).toHaveClass('t-hidden');
		expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

		fireEvent.click(toggleButton);

		// After clicking, the alert should be visible and button expanded
		expect(infoAlertContainer).not.toHaveClass('t-hidden');
		expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

		fireEvent.click(toggleButton);

		// After clicking again, the alert should be hidden again
		expect(infoAlertContainer).toHaveClass('t-hidden');
		expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
	});

	it('sets correct ARIA roles and attributes for different alert types', async () => {
		await render();

		// Toggle all alerts to make them visible
		fireEvent.click(screen.getByTestId('toggle-info-button'));
		fireEvent.click(screen.getByTestId('toggle-callout-button'));
		fireEvent.click(screen.getByTestId('toggle-success-button'));
		fireEvent.click(screen.getByTestId('toggle-warning-button'));
		fireEvent.click(screen.getByTestId('toggle-danger-button'));

		// Check content and ARIA attributes
		const infoAlert = screen.getByTestId('info-alert');
		expect(infoAlert).toHaveAttribute('role', 'alert');
		expect(infoAlert).toHaveAttribute('aria-live', 'polite');
		expect(infoAlert).toHaveTextContent('This is an info alert with useful information');

		const callout = screen.getByTestId('callout');
		expect(callout).toHaveAttribute('role', 'note');
		expect(callout).toHaveAttribute('aria-live', 'off');
		expect(callout).toHaveTextContent(
			'This is a callout with useful information that does not trigger ARIA alerts',
		);

		const successAlert = screen.getByTestId('success-alert');
		expect(successAlert).toHaveAttribute('role', 'alert');
		expect(successAlert).toHaveAttribute('aria-live', 'assertive');
		expect(successAlert).toHaveTextContent('Operation completed successfully');

		const warningAlert = screen.getByTestId('warning-alert');
		expect(warningAlert).toHaveAttribute('role', 'alert');
		expect(warningAlert).toHaveAttribute('aria-live', 'assertive');
		expect(warningAlert).toHaveTextContent('Please review your input before proceeding');

		const dangerAlert = screen.getByTestId('danger-alert');
		expect(dangerAlert).toHaveAttribute('role', 'alert');
		expect(dangerAlert).toHaveAttribute('aria-live', 'assertive');
		expect(dangerAlert).toHaveTextContent('An error occurred while processing your request');
	});
});
