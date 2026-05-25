import { afterEach, describe, expect, it } from 'vitest';

import {
	registerValidator,
	addValidator,
	isTouched,
	markTouched,
	isDirty,
	markDirty,
	clearDirty,
	validateElement,
	writeError,
} from './validate';

describe('validate', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	describe('registerValidator', () => {
		it('registers and runs named validator', async () => {
			registerValidator('test-required', (el) => {
				return (el as HTMLInputElement).value ? null : 'Required';
			});

			const input = document.createElement('input');
			input.setAttribute('data-validators', 'test-required');
			input.value = '';

			const msg = await validateElement(input);
			expect(msg).toBe('Required');
		});

		it('returns null when valid', async () => {
			registerValidator('test-nonempty', (el) => {
				return (el as HTMLInputElement).value ? null : 'Empty';
			});

			const input = document.createElement('input');
			input.setAttribute('data-validators', 'test-nonempty');
			input.value = 'hello';

			const msg = await validateElement(input);
			expect(msg).toBeNull();
		});
	});

	describe('addValidator (WeakMap)', () => {
		it('adds and runs inline validator', async () => {
			const input = document.createElement('input');
			input.value = 'bob';

			addValidator(input, (el) => {
				return (el as HTMLInputElement).value.includes('bob') ? 'No Bobs' : null;
			});

			const msg = await validateElement(input);
			expect(msg).toBe('No Bobs');
		});

		it('cleanup removes validator', async () => {
			const input = document.createElement('input');
			input.value = 'bob';

			const cleanup = addValidator(input, () => 'Error');
			cleanup();

			const msg = await validateElement(input);
			expect(msg).toBeNull();
		});
	});

	describe('touch tracking', () => {
		it('starts untouched', () => {
			const el = document.createElement('input');
			expect(isTouched(el)).toBe(false);
		});

		it('marks touched', () => {
			const el = document.createElement('input');
			markTouched(el);
			expect(isTouched(el)).toBe(true);
		});
	});

	describe('dirty tracking', () => {
		it('starts not dirty', () => {
			const form = document.createElement('form');
			expect(isDirty(form)).toBe(false);
		});

		it('tracks dirty state', () => {
			const form = document.createElement('form');
			const input = document.createElement('input');
			form.appendChild(input);
			document.body.appendChild(form);

			markDirty(input);
			expect(isDirty(form)).toBe(true);

			clearDirty(form);
			expect(isDirty(form)).toBe(false);
		});
	});

	describe('aria-disabled skips validation', () => {
		it('returns null for disabled elements', async () => {
			const input = document.createElement('input');
			input.required = true;
			input.value = '';
			input.setAttribute('aria-disabled', 'true');

			const msg = await validateElement(input);
			expect(msg).toBeNull();
		});
	});

	describe('writeError', () => {
		it('writes error to described-by target', () => {
			const input = document.createElement('input');
			input.setAttribute('aria-describedby', 'err-1');
			const errEl = document.createElement('span');
			errEl.id = 'err-1';
			errEl.setAttribute('data-js', 't-validate-error');
			document.body.appendChild(input);
			document.body.appendChild(errEl);

			writeError(input, 'Something wrong');
			expect(errEl.textContent).toBe('Something wrong');
			expect(errEl.getAttribute('role')).toBe('alert');
			expect(input.getAttribute('aria-invalid')).toBe('true');
		});

		it('clears error', () => {
			const input = document.createElement('input');
			input.setAttribute('aria-describedby', 'err-2');
			const errEl = document.createElement('span');
			errEl.id = 'err-2';
			errEl.setAttribute('data-js', 't-validate-error');
			document.body.appendChild(input);
			document.body.appendChild(errEl);

			writeError(input, 'Error');
			writeError(input, null);
			expect(errEl.textContent).toBe('');
			expect(errEl.getAttribute('role')).toBeNull();
			expect(input.getAttribute('aria-invalid')).toBeNull();
		});
	});
});
