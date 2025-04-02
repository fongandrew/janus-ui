import { fireEvent, screen } from '@solidjs/testing-library';

import { renderImport } from '~/shared/utility/test-utils/render';

const render = () => renderImport('~/demos/checkboxes-demo', 'CheckboxesDemo');

describe('CheckboxesDemo', () => {
	it('renders all checkbox variants with correct states', async () => {
		await render();

		const defaultCheckbox = screen.getByTestId('default-checkbox');
		expect(defaultCheckbox).not.toBeChecked();

		const checkedCheckbox = screen.getByTestId('checked-checkbox');
		expect(checkedCheckbox).toHaveAttribute('name', 'checked');

		const indeterminateCheckbox = screen.getByTestId('indeterminate-checkbox');
		expect(indeterminateCheckbox).toHaveAttribute('name', 'indetermine');

		const invalidCheckbox = screen.getByTestId('invalid-checkbox');
		expect(invalidCheckbox).toHaveAttribute('aria-invalid', 'true');

		const disabledCheckbox = screen.getByTestId('disabled-checkbox');
		expect(disabledCheckbox).toHaveAttribute('aria-disabled', 'true');
	});

	it('toggles checkbox when clicking the input element directly', async () => {
		await render();

		const defaultCheckbox = screen.getByTestId('default-checkbox');
		expect(defaultCheckbox).not.toBeChecked();

		// Click to check (directly on input)
		fireEvent.click(defaultCheckbox);
		expect(defaultCheckbox).toBeChecked();

		// Click to uncheck (directly on input)
		fireEvent.click(defaultCheckbox);
		expect(defaultCheckbox).not.toBeChecked();
	});

	it('toggles checkbox when clicking the SVG/visual part of the checkbox', async () => {
		await render();

		const defaultCheckbox = screen.getByTestId('default-checkbox');
		expect(defaultCheckbox).not.toBeChecked();

		const svg = defaultCheckbox.parentElement?.querySelector('svg');

		fireEvent.click(svg!);
		expect(defaultCheckbox).toBeChecked();

		fireEvent.click(svg!);
		expect(defaultCheckbox).not.toBeChecked();
	});

	it('respects disabled state when clicking on visual elements', async () => {
		await render();

		const disabledCheckbox = screen.getByTestId('disabled-checkbox');
		expect(disabledCheckbox).toHaveAttribute('aria-disabled', 'true');
		expect(disabledCheckbox).not.toBeChecked();

		const svg = disabledCheckbox.parentElement?.querySelector('svg');

		// Click on container - should not change state because it's disabled
		fireEvent.click(svg!);
		expect(disabledCheckbox).not.toBeChecked();
	});

	it('renders toggle switch', async () => {
		await render();

		const toggleSwitch = screen.getByTestId('toggle-switch');
		expect(toggleSwitch).toBeInTheDocument();
		expect(toggleSwitch).not.toBeChecked();

		// Click to toggle on
		fireEvent.click(toggleSwitch);
		expect(toggleSwitch).toBeChecked();

		// Click to toggle off
		fireEvent.click(toggleSwitch);
		expect(toggleSwitch).not.toBeChecked();
	});

	it('toggles toggle switch which clicking div thumb', async () => {
		await render();

		const toggleSwitch = screen.getByTestId('toggle-switch');
		const thumb = toggleSwitch.parentElement?.querySelector('div');

		// Click to toggle on
		fireEvent.click(thumb!);
		expect(toggleSwitch).toBeChecked();

		// Click to toggle off
		fireEvent.click(thumb!);
		expect(toggleSwitch).not.toBeChecked();
	});
});
