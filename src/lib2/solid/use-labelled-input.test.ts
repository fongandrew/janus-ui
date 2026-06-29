import { describe, expect, it } from 'vitest';

import { useLabelledInput } from '~/lib2/solid/use-labelled-input';

describe('useLabelledInput', () => {
	it('generates deterministic IDs from the input id', () => {
		const r = useLabelledInput({ id: 'email' });
		expect(r.ids).toEqual({
			input: 'email',
			label: 'email-label',
			description: 'email-desc',
			error: 'email-err',
		});
		expect(r.labelProps).toEqual({ id: 'email-label', for: 'email' });
	});

	it('joins description + error IDs into aria-describedby only when rendered', () => {
		const withDesc = useLabelledInput({ id: 'x', hasDescription: true });
		expect(withDesc.inputProps['aria-describedby']).toBe('x-desc x-err');

		const noDesc = useLabelledInput({ id: 'x' });
		expect(noDesc.inputProps['aria-describedby']).toBe('x-err');
	});

	it('emits aria-required / aria-invalid when set', () => {
		const r = useLabelledInput({ id: 'x', required: true, invalid: true });
		expect(r.inputProps['aria-required']).toBe(true);
		expect(r.inputProps['aria-invalid']).toBe(true);
	});

	it('marks the error slot external when errorMessage is controlled', () => {
		const controlled = useLabelledInput({ id: 'x', hasErrorMessage: true });
		expect(controlled.errorProps['data-external-error']).toBe('');

		const engine = useLabelledInput({ id: 'x' });
		expect('data-external-error' in engine.errorProps).toBe(false);
	});
});
