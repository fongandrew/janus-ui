import { fireEvent, screen, waitFor } from '@solidjs/testing-library';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FORM_BUSY_ATTR } from '~/shared/components/callbacks/form';
import { renderImport } from '~/shared/utility/test-utils/render';
import { getTestMode } from '~/shared/utility/test-utils/test-mode';

const render = () => renderImport('~/demos/form-submit-demo', 'FormSubmitDemo');

describe('FormSubmitDemo', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('shows busy state during form submission and displays submitted data', async () => {
		const container = await render();

		// Fill in the form
		const nameInput = screen.getByTestId('name-input');
		const messageTextarea = screen.getByTestId('message-textarea');
		const submitButton = screen.getByTestId('submit-button');
		const asyncForm = screen.getByTestId('async-form');

		fireEvent.input(nameInput, { target: { value: 'Test User' } });
		fireEvent.input(messageTextarea, { target: { value: 'This is a test message' } });

		// Submit the form
		fireEvent.click(submitButton);

		// Check that form has busy attribute immediately after submission
		expect(asyncForm).toHaveAttribute(FORM_BUSY_ATTR);

		// Fast-forward time to complete the submission
		vi.advanceTimersByTime(1100);

		await waitFor(() => {
			// Form should no longer be busy
			expect(asyncForm).not.toHaveAttribute(FORM_BUSY_ATTR);
		});

		// Check that submitted data is displayed correctly
		if (getTestMode() === 'ssr') {
			const output = container.querySelector('output');
			expect(JSON.parse(output?.textContent ?? '')).toEqual({
				name: ['Test User'],
				message: ['This is a test message'],
			});
		} else {
			expect(screen.getByTestId('submitted-name')).toHaveTextContent('Test User');
			expect(screen.getByTestId('submitted-message')).toHaveTextContent(
				'This is a test message',
			);
		}
	});

	it('clears the form when reset button is clicked', async () => {
		await render();

		// Fill in the form
		const nameInput = screen.getByTestId('name-input');
		const messageTextarea = screen.getByTestId('message-textarea');
		const resetButton = screen.getByTestId('reset-button');

		fireEvent.input(nameInput, { target: { value: 'Test User' } });
		fireEvent.input(messageTextarea, { target: { value: 'This is a test message' } });

		// Verify inputs have values
		expect(nameInput).toHaveValue('Test User');
		expect(messageTextarea).toHaveValue('This is a test message');

		// Click reset button
		fireEvent.click(resetButton);

		// Verify inputs are cleared
		expect(nameInput).toHaveValue('');
		expect(messageTextarea).toHaveValue('');
	});

	it('shows error message when error checkbox is checked', async () => {
		await render();

		// Fill in the form and check the error checkbox
		const nameInput = screen.getByTestId('name-input');
		const messageTextarea = screen.getByTestId('message-textarea');
		const errorCheckbox = screen.getByTestId('error-checkbox');
		const submitButton = screen.getByTestId('submit-button');
		const asyncForm = screen.getByTestId('async-form');

		fireEvent.input(nameInput, { target: { value: 'Test User' } });
		fireEvent.input(messageTextarea, { target: { value: 'This is a test message' } });
		fireEvent.click(errorCheckbox);

		// Mock for expected error only
		vi.spyOn(console, 'error').mockImplementation((err: Error) => {
			expect(err.message).toBe('Form submission failed (as requested)');
		});

		// Submit the form
		fireEvent.click(submitButton);
		vi.advanceTimersByTime(1100);

		// Wait for the error to be displayed
		await waitFor(() => {
			// Find the alert with the error message
			const errorAlerts = screen.getAllByRole('alert');
			const errorAlert = errorAlerts.find((alert) =>
				alert.textContent?.includes('Form submission failed (as requested)'),
			);

			expect(errorAlert).toBeDefined();

			// Verify form has aria-describedby pointing to the error alert
			const formId = errorAlert?.getAttribute('id');
			expect(formId).toBeTruthy();
			expect(asyncForm).toHaveAttribute('aria-describedby', formId);
		});

		// Verify the submitted data card is not shown
		expect(screen.queryByTestId('submitted-data-card')).not.toBeInTheDocument();
	});
});
