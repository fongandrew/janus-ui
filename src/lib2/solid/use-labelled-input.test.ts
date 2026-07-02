import { describe, expect, it } from 'vitest';

import { useLabelledInput } from '~/lib2/solid/use-labelled-input';

describe('useLabelledInput', () => {
	it('generates deterministic IDs from the given id', () => {
		const l = useLabelledInput({ id: 'email' });
		expect(l.ids).toEqual({
			id: 'email',
			labelId: 'email-label',
			descId: 'email-desc',
			errId: 'email-err',
		});
		expect(l.labelProps).toEqual({ id: 'email-label', for: 'email' });
	});

	it('joins description into aria-describedby only when rendered', () => {
		const withDesc = useLabelledInput({ id: 'x', description: true });
		expect(withDesc.inputProps['aria-describedby']).toBe('x-desc x-err');

		const withoutDesc = useLabelledInput({ id: 'x' });
		expect(withoutDesc.inputProps['aria-describedby']).toBe('x-err');
	});

	it('emits the data-external-error marker only when errorMessage is present', () => {
		const controlled = useLabelledInput({ id: 'x', errorMessage: null });
		expect(controlled.errorProps['data-external-error']).toBe(true);

		const engineOwned = useLabelledInput({ id: 'x' });
		expect('data-external-error' in engineOwned.errorProps).toBe(false);
	});

	it('maps required and invalid to ARIA on inputProps', () => {
		const l = useLabelledInput({ id: 'x', required: true, invalid: true });
		expect(l.inputProps['aria-required']).toBe(true);
		expect(l.inputProps['aria-invalid']).toBe(true);
	});
});
