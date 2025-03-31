import { screen } from '@solidjs/testing-library';

import { BadgeAndCountDemo } from '~/demos/badge-and-count-demo';
import { renderContainer } from '~/shared/utility/test-utils/render';

describe('BadgeAndCountDemo', () => {
	it('renders counts with correct values and truncation', async () => {
		await renderContainer(() => <BadgeAndCountDemo />);

		// Normal counts (not truncated)
		expect(screen.getByTestId('count-1')).toHaveTextContent('1');

		// Truncated counts based on digits
		expect(screen.getByTestId('count-10')).toHaveTextContent('9+');
		expect(screen.getByTestId('count-12-2digits')).toHaveTextContent('12');
		expect(screen.getByTestId('count-100-2digits')).toHaveTextContent('99+');
		expect(screen.getByTestId('count-125-3digits')).toHaveTextContent('125');
		expect(screen.getByTestId('count-1000-3digits')).toHaveTextContent('999+');
	});

	it('sets correct aria-label on counts based on the label function', async () => {
		await renderContainer(() => <BadgeAndCountDemo />);

		expect(screen.getByTestId('count-1')).toHaveAttribute('aria-label', '1 item');
		expect(screen.getByTestId('count-10')).toHaveAttribute('aria-label', '9+ items');
		expect(screen.getByTestId('count-12-2digits')).toHaveAttribute('aria-label', '12 items');
		expect(screen.getByTestId('count-100-2digits')).toHaveAttribute('aria-label', '99+ items');
		expect(screen.getByTestId('count-125-3digits')).toHaveAttribute('aria-label', '125 items');
		expect(screen.getByTestId('count-1000-3digits')).toHaveAttribute(
			'aria-label',
			'999+ items',
		);
	});
});
