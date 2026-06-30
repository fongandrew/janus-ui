import { describe, expect, it } from 'vitest';

import { useLabelledInput } from '~/lib2/solid/use-labelled-input';

describe('useLabelledInput', () => {
	it('generates deterministic IDs from the input id', () => {
		const { ids } = useLabelledInput({ id: 'email' });
		expect(ids).toEqual({
			input: 'email',
			label: 'email-label',
			desc: 'email-desc',
			err: 'email-err',
		});
		expect(ids.label).toBe(`${ids.input}-label`);
		expect(ids.desc).toBe(`${ids.input}-desc`);
		expect(ids.err).toBe(`${ids.input}-err`);
	});

	it('inputProps.id matches the input id and labelProps/descriptionProps/errorProps use the derived IDs', () => {
		const { inputProps, labelProps, descriptionProps, errorProps } = useLabelledInput({
			id: 'email',
			description: 'desc',
		});
		expect(inputProps.id).toBe('email');
		expect(labelProps.id).toBe('email-label');
		expect(descriptionProps.id).toBe('email-desc');
		expect(errorProps.id).toBe('email-err');
	});

	it('aria-describedby includes the description id only when a description is given', () => {
		const withDescription = useLabelledInput({ id: 'email', description: 'desc' });
		expect(withDescription.inputProps['aria-describedby']).toBe('email-desc email-err');

		const withoutDescription = useLabelledInput({ id: 'email' });
		expect(withoutDescription.inputProps['aria-describedby']).toBe('email-err');
	});

	it('aria-required / aria-invalid reflect the options', () => {
		const plain = useLabelledInput({ id: 'email' });
		expect(plain.inputProps['aria-required']).toBeUndefined();
		expect(plain.inputProps['aria-invalid']).toBeUndefined();

		const required = useLabelledInput({ id: 'email', required: true });
		expect(required.inputProps['aria-required']).toBe(true);

		const invalid = useLabelledInput({ id: 'email', invalid: true });
		expect(invalid.inputProps['aria-invalid']).toBe(true);
	});

	it('aria-invalid is also true when the errorMessage accessor currently returns truthy', () => {
		const { inputProps } = useLabelledInput({ id: 'email', errorMessage: () => 'Required' });
		expect(inputProps['aria-invalid']).toBe(true);
	});

	describe('data-external-error', () => {
		it('is omitted when errorMessage is not passed (engine-written path)', () => {
			const { errorProps } = useLabelledInput({ id: 'email' });
			expect(errorProps['data-external-error']).toBeUndefined();
			expect('data-external-error' in errorProps).toBe(false);
		});

		it('is present when errorMessage is passed, even if it currently returns null', () => {
			const { errorProps } = useLabelledInput({ id: 'email', errorMessage: () => null });
			expect(errorProps['data-external-error']).toBe(true);
		});
	});

	it('errorProps always carries the t-validate-error marker', () => {
		const { errorProps } = useLabelledInput({ id: 'email' });
		expect(errorProps['data-js']).toBe('t-validate-error');
	});
});
