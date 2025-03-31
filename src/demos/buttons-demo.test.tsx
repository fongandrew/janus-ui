import { screen } from '@solidjs/testing-library';

import { ButtonsDemo } from '~/demos/buttons-demo';
import { renderContainer } from '~/shared/utility/test-utils/render';

describe('ButtonsDemo', () => {
	it('renders all button variants', async () => {
		await renderContainer(() => <ButtonsDemo />);

		// Count total number of buttons
		const buttons = screen.getAllByRole('button');
		expect(buttons).toHaveLength(10); // 3 size variants + 7 style variants

		// Check specific button variants by text
		expect(screen.getByText('Small Button')).toBeInTheDocument();
		expect(screen.getByText('Default Button')).toBeInTheDocument();
		expect(screen.getByText('Large Button')).toBeInTheDocument();
		expect(screen.getByText('Primary')).toBeInTheDocument();
		expect(screen.getByText('Danger')).toBeInTheDocument();
		expect(screen.getByText('Disabled')).toBeInTheDocument();
		expect(screen.getByText('Ghost')).toBeInTheDocument();
		expect(screen.getByText('Link')).toBeInTheDocument();

		// Check icon buttons by aria-label
		expect(screen.getByLabelText('Settings')).toBeInTheDocument();
		expect(screen.getByLabelText('More options')).toBeInTheDocument();
	});
});
