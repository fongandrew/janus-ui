import { fireEvent, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { renderImport } from '~/shared/utility/test-utils/render';

const render = () => renderImport('~/demos/list-boxes-demo', 'ListBoxesDemo');

describe('ListBoxesDemo', () => {
	it('renders list boxes with correct initial state', async () => {
		const container = await render();

		expect(container.querySelector('[name="single-listbox"]:checked')).toBeNull();
		expect(container.querySelector('[name="multi-listbox"]:checked')).toBeNull();

		const disabledChecked = container.querySelectorAll<HTMLInputElement>(
			'[name="disabled-listbox"]:checked',
		);
		expect(disabledChecked.length).toBe(1);
		expect(disabledChecked[0]?.value).toBe('fixed');
		expect(disabledChecked[0]).toHaveAttribute('aria-selected', 'true');
	});

	it('allows selecting items in single-selection list box', async () => {
		await render();

		// Find inputs by their values
		const appleInput = screen.getByDisplayValue('apple');
		const bananaInput = screen.getByDisplayValue('banana');

		// Initially nothing should be selected
		expect(appleInput).toHaveAttribute('aria-selected', 'false');
		expect(bananaInput).toHaveAttribute('aria-selected', 'false');

		// Select apple by clicking on the label containing "Apple"
		fireEvent.click(screen.getByText('Apple'));

		// Now apple should be selected
		expect(appleInput).toHaveAttribute('aria-selected', 'true');
		expect(bananaInput).toHaveAttribute('aria-selected', 'false');

		// Selection description should be updated
		expect(screen.getByText('Selected: apple', { exact: false })).toBeInTheDocument();

		// Select banana should change selection
		fireEvent.click(screen.getByText('Banana'));

		// Now banana should be selected and apple should be deselected
		expect(appleInput).toHaveAttribute('aria-selected', 'false');
		expect(bananaInput).toHaveAttribute('aria-selected', 'true');

		// Selection description should be updated
		expect(screen.getByText('Selected: banana', { exact: false })).toBeInTheDocument();
	});

	it('allows multiple selections in multi-selection list box', async () => {
		await render();

		// Find inputs by their values in the multi-select list box
		const greenInput = screen.getByDisplayValue('green');
		const blueInput = screen.getByDisplayValue('blue');

		// Initially nothing should be selected
		expect(greenInput).toHaveAttribute('aria-selected', 'false');
		expect(blueInput).toHaveAttribute('aria-selected', 'false');

		// Select green
		fireEvent.click(screen.getByText('Green'));

		// Green should be selected
		expect(greenInput).toHaveAttribute('aria-selected', 'true');
		expect(blueInput).toHaveAttribute('aria-selected', 'false');

		// Selection description should be updated
		expect(screen.getByText('Selected: green', { exact: false })).toBeInTheDocument();

		// Select blue - in multi-select both should be selected
		fireEvent.click(screen.getByText('Blue'));

		// Now both should be selected
		expect(greenInput).toHaveAttribute('aria-selected', 'true');
		expect(blueInput).toHaveAttribute('aria-selected', 'true');

		// Description should show both selected values
		const descriptions = screen.getAllByText(/Selected:/, { exact: false });
		// Find the one that contains both green and blue
		const multiDescription = descriptions.find(
			(el) => el.textContent?.includes('green') && el.textContent?.includes('blue'),
		);
		expect(multiDescription).toBeDefined();
	});

	it('shows error when selecting "Red" option', async () => {
		await render();

		// Initially no error message
		expect(screen.queryByText("Don't pick red.")).not.toBeInTheDocument();

		// Select red option by clicking on the text
		fireEvent.click(screen.getByText('Red'));

		// Error message should appear
		expect(screen.getByText("Don't pick red.")).toBeInTheDocument();

		// Find the input for Red and check its parent listbox
		const redInput = screen.getByDisplayValue('red');
		const listBox = redInput.closest('[role="listbox"]');
		expect(listBox).toHaveAttribute('aria-invalid', 'true');
	});
});
