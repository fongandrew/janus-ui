import { screen } from '@solidjs/testing-library';

import { ButtonLinksDemo } from '~/demos/button-links-demo';
import { renderContainer } from '~/shared/utility/test-utils/render';

describe('ButtonLinksDemo', () => {
	it('renders all button link variants', async () => {
		await renderContainer(() => <ButtonLinksDemo />);

		// Verify title renders
		expect(screen.getByText('Button Links')).toBeInTheDocument();

		// Check all link variants are rendered with an href
		const links = screen.getAllByRole('link');
		expect(links).toHaveLength(4);

		links.forEach((link) => {
			expect(link).toHaveAttribute('href', '#');
		});
	});
});
