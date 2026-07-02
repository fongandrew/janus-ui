import { beforeEach, describe, expect, it } from 'vitest';

import {
	addValidator,
	registerValidator,
	setErrors,
	setFieldError,
	validateField,
} from '~/lib2/dom/form/validate';

function field(html: string): HTMLInputElement {
	document.body.innerHTML = `<form>${html}</form>`;
	return document.querySelector('input')!;
}

describe('form validation', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('runs a named validator from data-validators', async () => {
		registerValidator('no-bob', (el) =>
			(el as HTMLInputElement).value.includes('bob') ? 'No Bobs allowed' : null,
		);
		const el = field('<input data-validators="no-bob">');
		el.value = 'bob';
		expect(await validateField(el)).toBe('No Bobs allowed');
		el.value = 'alice';
		expect(await validateField(el)).toBeNull();
	});

	it('uses native HTML5 validity first', async () => {
		const el = field('<input required>');
		expect(await validateField(el)).toBeTruthy();
		el.value = 'x';
		expect(await validateField(el)).toBeNull();
	});

	it('runs inline validators registered by element identity', async () => {
		const el = field('<input>');
		addValidator(el, (e) => ((e as HTMLInputElement).value === 'no' ? 'nope' : null));
		el.value = 'no';
		expect(await validateField(el)).toBe('nope');
	});

	it('writes the message to the aria-describedby error destination', async () => {
		document.body.innerHTML =
			'<form><input id="e" required aria-describedby="err"><span id="err" data-js="t-validate-error"></span></form>';
		const el = document.getElementById('e') as HTMLInputElement;
		await validateField(el);
		const dest = document.getElementById('err')!;
		expect(dest.textContent).toBeTruthy();
		expect(dest.getAttribute('role')).toBe('alert');
		expect(el.getAttribute('aria-invalid')).toBe('true');

		el.value = 'ok';
		await validateField(el);
		expect(dest.textContent).toBe('');
		expect(el.hasAttribute('aria-invalid')).toBe(false);
	});

	it('skips aria-disabled fields', async () => {
		const el = field('<input required aria-disabled="true">');
		expect(await validateField(el)).toBeNull();
	});

	it('setErrors applies server errors keyed by name', () => {
		document.body.innerHTML = '<form><input name="email"></form>';
		const form = document.querySelector('form')!;
		setErrors(form, { email: 'Already taken' });
		const emailEl = form.elements.namedItem('email') as HTMLElement;
		expect(emailEl.getAttribute('aria-invalid')).toBe('true');
	});

	it('setFieldError clears aria-invalid when passed null', () => {
		const el = field('<input>');
		setFieldError(el, 'bad');
		expect(el.getAttribute('aria-invalid')).toBe('true');
		setFieldError(el, null);
		expect(el.hasAttribute('aria-invalid')).toBe(false);
	});
});
