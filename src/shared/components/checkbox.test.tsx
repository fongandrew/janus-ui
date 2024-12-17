import { render, screen } from '@solidjs/testing-library';

import { Checkbox } from '~/shared/components/checkbox';

describe('Checkbox', () => {
	it('renders unchecked by default', () => {
		render(() => <Checkbox />);
		expect(screen.getByRole('checkbox')).not.toBeChecked();
	});

	it('renders checked when checked prop is true', () => {
		render(() => <Checkbox checked />);
		expect(screen.getByRole('checkbox')).toBeChecked();
	});

	it('renders indeterminate state', () => {
		render(() => <Checkbox indeterminate />);
		const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
		expect(checkbox.indeterminate).toBe(true);
	});
});
