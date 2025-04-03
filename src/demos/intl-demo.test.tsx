import { screen } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { renderImport } from '~/shared/utility/test-utils/render';

describe('IntlDemo', () => {
	it('renders all internationalization formatting components correctly', async () => {
		await renderImport('~/demos/intl-demo', 'IntlDemo');

		// Verify the card title and description
		expect(screen.getByText('Text Formatting')).toBeInTheDocument();
		expect(screen.getByText(/Some wrappers around the/)).toBeInTheDocument();

		// Check currency formatting
		expect(screen.getByText(/I'd buy that for/)).toBeInTheDocument();

		// Check date formatting
		expect(screen.getByText(/Today's date is/)).toBeInTheDocument();

		// Check time formatting
		expect(screen.getByText(/The time is/)).toBeInTheDocument();

		// Check date time formatting
		expect(screen.getByText(/The date \+ time is/)).toBeInTheDocument();

		// Check relative time formatting
		expect(screen.getByText(/That was/)).toBeInTheDocument();

		// Check integer formatting
		expect(screen.getByText(/My favorite number is/)).toBeInTheDocument();

		// Check percentage formatting
		expect(screen.getByText(/I'd give you/)).toBeInTheDocument();

		// Check list formatting
		const listText = screen.getByText(/My partners are/);
		expect(listText).toBeInTheDocument();
		expect(listText.textContent).toContain('Alice');
		expect(listText.textContent).toContain('Bob');
		expect(listText.textContent).toContain('Scott');
	});
});
