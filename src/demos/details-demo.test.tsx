import { fireEvent, screen } from '@solidjs/testing-library';

import { DetailsDemo } from '~/demos/details-demo';
import { renderContainer } from '~/shared/utility/test-utils/render';

describe('DetailsDemo', () => {
	it('renders details components in closed state by default', async () => {
		await renderContainer(() => <DetailsDemo />);

		// Check that both details elements are rendered
		const details1 = screen.getByTestId('details-1');
		const details2 = screen.getByTestId('details-2');

		expect(details1).toBeInTheDocument();
		expect(details2).toBeInTheDocument();

		// Verify summaries are visible
		expect(screen.getByText('Click to expand')).toBeInTheDocument();
		expect(screen.getByText('Here is another example')).toBeInTheDocument();

		// Details should be closed by default (details elements don't have open attribute)
		expect(details1).not.toHaveAttribute('open');
		expect(details2).not.toHaveAttribute('open');

		// Content should exist in the DOM but not be visible
		const contentText = 'This is the content inside the details component.';
		const contentElement = screen.getByText((content) => content.includes(contentText));
		expect(contentElement).toBeInTheDocument();
	});

	it('opens and closes the details when clicking the summary', async () => {
		await renderContainer(() => <DetailsDemo />);

		const details1 = screen.getByTestId('details-1');
		const summary1 = screen.getByText('Click to expand');

		// Initially closed
		expect(details1).not.toHaveAttribute('open');

		// Click to open
		fireEvent.click(summary1);
		expect(details1).toHaveAttribute('open');

		// Click to close
		fireEvent.click(summary1);
		expect(details1).not.toHaveAttribute('open');
	});
});
