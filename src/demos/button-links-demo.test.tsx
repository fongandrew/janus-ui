import { screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { renderImport } from '~/shared/utility/test-utils/render';

const render = () => renderImport('~/demos/button-links-demo', 'ButtonLinksDemo');

describe('ButtonLinksDemo', () => {
	it('renders all button link variants', async () => {
		await render();

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
