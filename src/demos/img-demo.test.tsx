import { fireEvent, screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { renderImport } from '~/shared/utility/test-utils/render';

const render = () => renderImport('~/demos/img-demo', 'ImgDemo');

describe('ImgDemo', () => {
	it('renders images correctly', async () => {
		await render();

		// Check that all images are rendered initially
		const images = screen.getAllByRole('img');
		expect(images.length).toBe(3); // Two sky images and one broken image
	});

	it('shows error state for broken image', async () => {
		await render();

		// Find the intentionally broken image - the one with empty src
		const brokenImg = screen.getAllByRole('img')[2]; // The third image is broken

		// Simulate error event on the broken image
		fireEvent.error(brokenImg!);

		// After error event, the image should be hidden
		expect(brokenImg).toHaveClass('t-hidden');

		// Get all error elements by aria-label and filter for the visible one (not having t-hidden class)
		const errorElements = screen.getAllByLabelText('Image failed to load');
		const visibleErrorElement = errorElements.find((el) => !el.classList.contains('t-hidden'));

		expect(visibleErrorElement).toBeDefined();
	});
});
