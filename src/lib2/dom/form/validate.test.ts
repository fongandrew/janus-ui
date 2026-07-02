import { beforeEach, describe, expect, it } from 'vitest';

import {
	addValidator,
	computeError,
	isDirty,
	markTouched,
	registerValidator,
	resetForm,
	setErrors,
	validateField,
	validateForm,
} from '~/lib2/dom/form/validate';

function setupForm(html: string): HTMLFormElement {
	document.body.innerHTML = `<form>${html}</form>`;
	return document.querySelector('form')!;
}

describe('validate', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('native validity wins first', () => {
		const form = setupForm('<input name="email" required>');
		const input = form.elements.namedItem('email') as HTMLInputElement;
		expect(computeError(input)).toBeTruthy();
		input.value = 'x';
		expect(computeError(input)).toBeNull();
	});

	it('runs named validators from data-validators in order', () => {
		registerValidator('no-bob', (el) => (el.value.includes('bob') ? 'No Bobs allowed' : null));
		registerValidator('no-alice', (el) =>
			el.value.includes('alice') ? 'No Alices either' : null,
		);
		const form = setupForm('<input name="user" data-validators="no-bob no-alice">');
		const input = form.elements.namedItem('user') as HTMLInputElement;

		input.value = 'bob and alice';
		expect(computeError(input)).toBe('No Bobs allowed');
		input.value = 'just alice';
		expect(computeError(input)).toBe('No Alices either');
		input.value = 'carol';
		expect(computeError(input)).toBeNull();
	});

	it('runs WeakMap closure validators; cleanup removes them', () => {
		const form = setupForm('<input name="x">');
		const input = form.elements.namedItem('x') as HTMLInputElement;
		const cleanup = addValidator(input, (el) => (el.value === 'bad' ? 'Bad value' : null));
		input.value = 'bad';
		expect(computeError(input)).toBe('Bad value');
		cleanup();
		expect(computeError(input)).toBeNull();
	});

	it('skips aria-disabled fields even with violations', () => {
		const form = setupForm('<input name="x" required aria-disabled="true">');
		const input = form.elements.namedItem('x') as HTMLInputElement;
		expect(computeError(input)).toBeNull();
	});

	it('writes errors to the aria-describedby destination and toggles role', () => {
		const form = setupForm(
			'<input name="email" required aria-describedby="email-err">' +
				'<span id="email-err" data-js="t-validate-error"></span>',
		);
		const input = form.elements.namedItem('email') as HTMLInputElement;
		const dest = document.getElementById('email-err')!;

		validateField(input);
		expect(dest.textContent).not.toBe('');
		expect(dest.getAttribute('role')).toBe('alert');
		expect(input.getAttribute('aria-invalid')).toBe('true');

		input.value = 'ok';
		validateField(input);
		expect(dest.textContent).toBe('');
		expect(dest.getAttribute('role')).toBeNull();
		expect(input.getAttribute('aria-invalid')).toBeNull();
	});

	it('validateForm marks all touched and returns the first invalid member', () => {
		const form = setupForm('<input name="a" required><input name="b" required>');
		const first = validateForm(form);
		expect(first).toBe(form.elements.namedItem('a'));
	});

	it('server-fed errors persist until cleared and mark fields touched', () => {
		const form = setupForm(
			'<input name="email" aria-describedby="e-err"><span id="e-err" data-js="t-validate-error"></span>',
		);
		const input = form.elements.namedItem('email') as HTMLInputElement;
		setErrors(form, { email: 'Already taken' });
		expect(document.getElementById('e-err')!.textContent).toBe('Already taken');
		expect(computeError(input)).toBe('Already taken');
	});

	it('isDirty compares against default values across control kinds', () => {
		const form = setupForm(
			'<input name="t" value="a"><input type="checkbox" name="c">' +
				'<select name="s"><option value="1" selected>1</option><option value="2">2</option></select>',
		);
		expect(isDirty(form)).toBe(false);
		(form.elements.namedItem('t') as HTMLInputElement).value = 'b';
		expect(isDirty(form)).toBe(true);
		resetForm(form);
		expect(isDirty(form)).toBe(false);
		(form.elements.namedItem('c') as HTMLInputElement).checked = true;
		expect(isDirty(form)).toBe(true);
	});

	it('touched-state machine: untouched → touched', () => {
		const form = setupForm('<input name="x" required>');
		const input = form.elements.namedItem('x') as HTMLInputElement;
		markTouched(input);
		expect(validateField(input)).toBeTruthy();
	});
});
