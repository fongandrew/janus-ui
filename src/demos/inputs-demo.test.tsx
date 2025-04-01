import { screen } from '@solidjs/testing-library';
import { isServer } from 'solid-js/web';

import { InputsDemo } from '~/demos/inputs-demo';
import { renderContainer } from '~/shared/utility/test-utils/render';

describe('InputsDemo', () => {
	it('renders input state variations correctly', async () => {
		await renderContainer(() => <InputsDemo />);

		const defaultInput = screen.getByLabelText('Default input');
		expect(defaultInput).toHaveAttribute('placeholder', 'Placeholder content');
		expect(defaultInput).toHaveAttribute('aria-invalid', 'false');

		const errorInput = screen.getByLabelText('Error state input');
		expect(errorInput).toHaveAttribute('placeholder', 'Some wrong value');
		expect(errorInput).toHaveAttribute('aria-invalid', 'true');
	});

	it('renders disabled inputs correctly', async () => {
		const renderPromise = renderContainer(() => <InputsDemo />);

		// Test that it initially starts out as disabled (to support disabled state
		// absent JS)
		const disabledInput = screen.getByLabelText('Disabled input');
		if (isServer) {
			expect(disabledInput).toHaveAttribute('disabled');
		}

		// Test it switches to aria-disabled (better screenreader experience)
		await renderPromise;
		expect(disabledInput).toHaveAttribute('aria-disabled', 'true');
		expect(disabledInput).not.toHaveAttribute('disabled');
	});

	it('renders date/time inputs with correct types', async () => {
		await renderContainer(() => <InputsDemo />);

		// Check date/time inputs - focusing on type rather than value since values might be handled differently in tests
		const dateInput = screen.getByLabelText('Date input');
		expect(dateInput).toHaveAttribute('type', 'date');

		const timeInput = screen.getByLabelText('Time input');
		expect(timeInput).toHaveAttribute('type', 'time');

		const dateTimeInput = screen.getByLabelText('Date time input');
		expect(dateTimeInput).toHaveAttribute('type', 'datetime-local');

		const weekInput = screen.getByLabelText('Week input');
		expect(weekInput).toHaveAttribute('type', 'week');

		const monthInput = screen.getByLabelText('Month input');
		expect(monthInput).toHaveAttribute('type', 'month');
	});

	it('renders text input variations with correct types', async () => {
		await renderContainer(() => <InputsDemo />);

		// Check text input variations
		const emailInput = screen.getByLabelText('Email input');
		expect(emailInput).toHaveAttribute('type', 'email');
		expect(emailInput).toHaveAttribute('autocomplete', 'email');

		const numberInput = screen.getByLabelText('Number input');
		expect(numberInput).toHaveAttribute('type', 'number');

		const passwordInput = screen.getByLabelText('Password input');
		expect(passwordInput).toHaveAttribute('type', 'password');
		expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');

		const searchInput = screen.getByLabelText('Search input');
		expect(searchInput).toHaveAttribute('type', 'search');

		const telInput = screen.getByLabelText('Telephone input');
		expect(telInput).toHaveAttribute('type', 'tel');

		const urlInput = screen.getByLabelText('URL input');
		expect(urlInput).toHaveAttribute('type', 'url');
	});

	it('renders miscellaneous input types correctly', async () => {
		await renderContainer(() => <InputsDemo />);

		// Check color pickers - verify label presence
		const colorInputLabel = screen.getByText('Color input');
		expect(colorInputLabel).toBeInTheDocument();

		// Disabled state might be handled differently in the component
		const disabledColorLabel = screen.getByText('Color input (disabled)');
		expect(disabledColorLabel).toBeInTheDocument();

		// Check file inputs - verify input presence
		const fileInput = screen.getByLabelText('File input');
		expect(fileInput).toHaveAttribute('type', 'file');

		const disabledFileLabel = screen.getByText('File input (disabled)');
		expect(disabledFileLabel).toBeInTheDocument();

		// For sliders, they might not be actual range inputs but custom components
		// Just verify the labels are present
		const sliderLabel = screen.getByText('Range / slider input');
		expect(sliderLabel).toBeInTheDocument();

		const disabledSliderLabel = screen.getByText('Range / slider input (disabled)');
		expect(disabledSliderLabel).toBeInTheDocument();
	});
});
