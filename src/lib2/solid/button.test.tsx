import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { Button } from '~/lib2/solid/button';

describe('Button', () => {
	it('renders aria-disabled and never native disabled (§13.1)', () => {
		const { getByRole } = render(() => <Button disabled>Click</Button>);
		const button = getByRole('button');
		expect(button.getAttribute('aria-disabled')).toBe('true');
		expect(button.hasAttribute('disabled')).toBe(false);
	});

	it('maps variant="primary" to v-colors-primary', () => {
		const { getByRole } = render(() => <Button variant="primary">Click</Button>);
		expect(getByRole('button').classList.contains('v-colors-primary')).toBe(true);
	});
});
