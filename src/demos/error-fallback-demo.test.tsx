import { fireEvent, screen } from '@solidjs/testing-library';
import { isServer } from 'solid-js/web';

import { ErrorFallbackDemo, resetErrorState } from '~/demos/error-fallback-demo';
import { renderContainer } from '~/shared/utility/test-utils/render';

describe('ErrorFallbackDemo', () => {
	beforeEach(() => {
		// Mock console.error to suppress expected error messages during tests
		vi.spyOn(console, 'error').mockImplementation(() => {});

		// Reset global error state before each test
		resetErrorState();
	});

	if (!isServer) {
		it('renders the error fallback demo with all buttons', async () => {
			await renderContainer(() => <ErrorFallbackDemo />);

			// Check that all the buttons are rendered
			expect(screen.getByTestId('section-error-button')).toBeInTheDocument();
			expect(screen.getByTestId('page-error-button')).toBeInTheDocument();
			expect(screen.getByTestId('modal-error-button')).toBeInTheDocument();

			// Check the title and description
			expect(screen.getByText('Error Boundaries')).toBeInTheDocument();
			expect(screen.getByText('Click to throw errors')).toBeInTheDocument();
		});
	}

	it('shows error fallback on section error', async () => {
		await renderContainer(() => <ErrorFallbackDemo />);

		// Click the section error button to trigger an error
		if (!isServer) {
			fireEvent.click(screen.getByTestId('section-error-button'));
		}

		// Error fallback should be displayed
		expect(screen.getByText('Something went wrong')).toBeInTheDocument();
		expect(screen.getByText(/Reloading the page might fix this issue/)).toBeInTheDocument();

		// Error details should be displayed
		expect(screen.getByText(/Error code:/)).toBeInTheDocument();
		expect(screen.getByText(/Event ID:/)).toBeInTheDocument();

		// Reload button should be present
		expect(screen.getByText('Reload')).toBeInTheDocument();

		// Support link should be present
		expect(screen.getByText('Contact support')).toBeInTheDocument();
		expect(screen.getByText('Contact support').closest('a')).toHaveAttribute(
			'href',
			'https://example.com/support',
		);
	});
});
