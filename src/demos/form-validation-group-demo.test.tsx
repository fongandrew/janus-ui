import { fireEvent, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { renderImport } from '~/shared/utility/test-utils/render';

const render = () => renderImport('~/demos/form-validation-group-demo', 'FormValidationGroupDemo');

describe('FormValidationGroupDemo', () => {
	it('validates username input (no spaces)', async () => {
		await render();

		const usernameInput = screen.getByLabelText('Username');
		const submitButton = screen.getByText('Submit');

		// Input invalid username
		fireEvent.change(usernameInput, { target: { value: 'user name' } });

		// Check for error message (implementation might vary, checking aria-invalid for now)
		expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
		// Ideally, check for a specific error message element if available
		const error = screen.queryByText('Username cannot contain spaces');
		expect(error).toBeInTheDocument();

		// Form should not submit
		userEvent.click(submitButton);
		expect(screen.queryByText('Submitted form data')).not.toBeInTheDocument();

		// Input valid username
		fireEvent.change(usernameInput, { target: { value: 'username' } });

		// Error should disappear
		expect(usernameInput).not.toHaveAttribute('aria-invalid', 'true');
		expect(screen.queryByText('Username cannot contain spaces')).not.toBeInTheDocument();
	});

	it('validates password confirmation', async () => {
		await render();

		const passwordInput = screen.getByLabelText('Password');
		const confirmPasswordInput = screen.getByLabelText('Confirm Password');
		const submitButton = screen.getByText('Submit');

		// Input first password (should not trigger validation)
		fireEvent.change(passwordInput, { target: { value: 'password123' } });
		expect(confirmPasswordInput).not.toHaveAttribute('aria-invalid', 'true');
		expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();

		// Input non-matching password, triggers error
		fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
		expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
		expect(screen.queryByText('Passwords do not match')).toBeInTheDocument();

		// Form should not submit
		fireEvent.click(submitButton);
		expect(screen.queryByText('Submitted form data')).not.toBeInTheDocument();

		// Input matching password again
		fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
		fireEvent.blur(confirmPasswordInput);

		// Error should disappear
		expect(confirmPasswordInput).not.toHaveAttribute('aria-invalid', 'true');
		expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
	});

	it('submits the form with valid data and displays output', async () => {
		await render();

		const usernameInput = screen.getByLabelText('Username');
		const passwordInput = screen.getByLabelText('Password');
		const confirmPasswordInput = screen.getByLabelText('Confirm Password');
		const submitButton = screen.getByText('Submit');

		// Fill in valid data
		fireEvent.change(usernameInput, { target: { value: 'validuser' } });
		fireEvent.change(passwordInput, { target: { value: 'password123' } });
		fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

		// Submit the form
		fireEvent.click(submitButton);

		// Check for specific submitted values
		const submittedUsername = screen.getByTestId('output-username');
		expect(submittedUsername).toHaveTextContent('validuser');
		const submittedPassword = screen.getByTestId('output-password');
		expect(submittedPassword).toHaveTextContent('password123');
	});

	it('clears the form and submitted data on reset', async () => {
		await render();

		const usernameInput = screen.getByLabelText('Username');
		const passwordInput = screen.getByLabelText('Password');
		const confirmPasswordInput = screen.getByLabelText('Confirm Password');
		const submitButton = screen.getByText('Submit');
		const resetButton = screen.getByText('Reset');

		// Fill in data and submit
		fireEvent.change(usernameInput, { target: { value: 'testuser' } });
		fireEvent.change(passwordInput, { target: { value: 'password123' } });
		fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
		fireEvent.click(submitButton);

		// Wait for submitted data to appear
		expect(screen.getByText('Submitted form data')).toBeInTheDocument();

		// Click reset
		fireEvent.click(resetButton);

		// Check that inputs are cleared and submitted data is gone
		await waitFor(() => {
			expect(usernameInput).toHaveValue('');
			expect(passwordInput).toHaveValue('');
			expect(confirmPasswordInput).toHaveValue('');
			expect(screen.queryByText('Submitted form data')).not.toBeInTheDocument();
		});
	});
});
