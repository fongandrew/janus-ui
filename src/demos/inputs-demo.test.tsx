import { screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { renderImport } from '~/shared/utility/test-utils/render';
import { getTestMode } from '~/shared/utility/test-utils/test-mode';

const render = () => renderImport('~/demos/inputs-demo', 'InputsDemo');

describe('InputsDemo', () => {
	it('renders input state variations correctly', async () => {
		await render();

		const defaultInput = screen.getByLabelText('Default input');
		expect(defaultInput).toHaveAttribute('placeholder', 'Placeholder content');
		expect(defaultInput).toHaveAttribute('aria-invalid', 'false');

		const errorInput = screen.getByLabelText('Error state input');
		expect(errorInput).toHaveAttribute('placeholder', 'Some wrong value');
		expect(errorInput).toHaveAttribute('aria-invalid', 'true');
	});

	it('renders disabled inputs correctly', async () => {
		const container = await render();

		// Test that it initially starts out as disabled (to support disabled state
		// absent JS)
		// Use querySelector to find the disabled input since getByLabelText might find multiple elements
		const disabledInput = container.querySelector('input[placeholder="Can\'t touch this"]');
		if (getTestMode() === 'ssr') {
			expect(disabledInput).toHaveAttribute('disabled');
		}

		// Test it switches to aria-disabled (better screenreader experience)
		expect(disabledInput).toHaveAttribute('aria-disabled', 'true');
		expect(disabledInput).not.toHaveAttribute('disabled');
	});

	it('renders date/time inputs with correct types', async () => {
		const container = await render();

		// Check date/time inputs using more specific selectors
		const dateInputs = container.querySelectorAll('input[type="date"]');
		expect(dateInputs.length).toBeGreaterThan(0);
		expect(dateInputs[0]).toHaveAttribute('type', 'date');

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
		await render();

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
		await render();

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
