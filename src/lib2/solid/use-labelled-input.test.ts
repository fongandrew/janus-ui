import { createRoot } from 'solid-js';
import { describe, expect, it } from 'vitest';

import { useLabelledInput } from '~/lib2/solid/use-labelled-input';

describe('useLabelledInput', () => {
	it('generates deterministic ids from the given id', () => {
		const { ids, labelProps, descriptionProps, errorProps, inputProps } = useLabelledInput({
			id: 'email',
		});
		expect(ids).toEqual({
			input: 'email',
			label: 'email-label',
			description: 'email-desc',
			error: 'email-err',
		});
		expect(inputProps.id).toBe('email');
		expect(labelProps).toEqual({ id: 'email-label', for: 'email' });
		expect(descriptionProps.id).toBe('email-desc');
		expect(errorProps.id).toBe('email-err');
	});

	it('generates a unique id when none is given', () => {
		createRoot((dispose) => {
			const a = useLabelledInput({});
			const b = useLabelledInput({});
			expect(a.ids.input).toBeTruthy();
			expect(a.ids.input).not.toBe(b.ids.input);
			expect(a.ids.label).toBe(`${a.ids.input}-label`);
			dispose();
		});
	});

	it('links the label via aria-labelledby', () => {
		const { inputProps } = useLabelledInput({ id: 'x', label: 'Name' });
		expect(inputProps['aria-labelledby']).toBe('x-label');
	});

	it('joins description + error ids in aria-describedby only when rendered', () => {
		const withDesc = useLabelledInput({ id: 'x', description: 'Helpful' });
		expect(withDesc.inputProps['aria-describedby']).toBe('x-desc x-err');

		const withoutDesc = useLabelledInput({ id: 'x' });
		expect(withoutDesc.inputProps['aria-describedby']).toBe('x-err');
	});

	it('emits aria-required / aria-invalid from options', () => {
		const on = useLabelledInput({ id: 'x', required: true, invalid: true });
		expect(on.inputProps['aria-required']).toBe('true');
		expect(on.inputProps['aria-invalid']).toBe('true');

		const off = useLabelledInput({ id: 'x' });
		expect(off.inputProps['aria-required']).toBeUndefined();
		expect(off.inputProps['aria-invalid']).toBeUndefined();
	});

	it('marks the error slot engine-owned by default', () => {
		const { errorProps } = useLabelledInput({ id: 'x' });
		expect(errorProps['data-js']).toBe('t-validate-error');
		expect(errorProps['data-external-error']).toBeUndefined();
	});

	it('emits data-external-error iff errorMessage is prop-controlled', () => {
		const controlled = useLabelledInput({ id: 'x', errorMessage: 'Bad' });
		expect(controlled.errorProps['data-external-error']).toBe('');
		expect(controlled.inputProps['aria-invalid']).toBe('true');

		// null = controlled but "no error": marker present, not invalid
		const empty = useLabelledInput({ id: 'x', errorMessage: null });
		expect(empty.errorProps['data-external-error']).toBe('');
		expect(empty.inputProps['aria-invalid']).toBeUndefined();
	});
});
