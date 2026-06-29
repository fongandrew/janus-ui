import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
	addValidator,
	getErrorElement,
	isDirty,
	registerValidator,
	setErrors,
	validateField,
	validateForm,
} from '~/lib2/dom/form/validate';

function makeForm(html: string): HTMLFormElement {
	const form = document.createElement('form');
	form.setAttribute('data-js', 't-validate');
	form.innerHTML = html;
	document.body.append(form);
	return form;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('validateField', () => {
	it('reports a native HTML5 validity error', () => {
		const form = makeForm(
			'<input id="email" name="email" required aria-describedby="email-err">' +
				'<span id="email-err" data-js="t-validate-error"></span>',
		);
		const input = form.querySelector('input')!;
		const err = validateField(input);
		expect(err).toBeTruthy();
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(getErrorElement(input)?.textContent).toBeTruthy();
	});

	it('clears the error once the field is valid', () => {
		const form = makeForm(
			'<input id="email" name="email" required aria-describedby="email-err">' +
				'<span id="email-err" data-js="t-validate-error"></span>',
		);
		const input = form.querySelector('input')!;
		validateField(input);
		input.value = 'a@b.com';
		validateField(input);
		expect(input.getAttribute('aria-invalid')).toBe('false');
		expect(getErrorElement(input)?.textContent).toBe('');
	});

	it('runs named validators from data-validators', () => {
		registerValidator('no-bob', (el) =>
			(el as HTMLInputElement).value.includes('bob') ? 'No Bobs' : null,
		);
		const form = makeForm('<input id="n" name="n" data-validators="no-bob">');
		const input = form.querySelector('input')!;
		input.value = 'bob';
		expect(validateField(input)).toBe('No Bobs');
		input.value = 'alice';
		expect(validateField(input)).toBe(null);
	});

	it('runs inline validators added by element identity', () => {
		const form = makeForm('<input id="n" name="n">');
		const input = form.querySelector('input')!;
		addValidator(input, (el) => ((el as HTMLInputElement).value ? null : 'Required'));
		expect(validateField(input)).toBe('Required');
		input.value = 'x';
		expect(validateField(input)).toBe(null);
	});

	it('skips aria-disabled fields', () => {
		const form = makeForm('<input id="n" name="n" required aria-disabled="true">');
		const input = form.querySelector('input')!;
		expect(validateField(input)).toBe(null);
	});
});

describe('validateForm', () => {
	it('returns true when any field is invalid', () => {
		const form = makeForm('<input name="a" required><input name="b" value="ok">');
		expect(validateForm(form)).toBe(true);
	});
});

describe('setErrors', () => {
	it('writes server-fed errors keyed by name', () => {
		const form = makeForm(
			'<input id="email" name="email" aria-describedby="email-err">' +
				'<span id="email-err" data-js="t-validate-error"></span>',
		);
		setErrors(form, { email: 'Already taken' });
		expect(getErrorElement(form.querySelector('input')!)?.textContent).toBe('Already taken');
	});
});

describe('isDirty', () => {
	let form: HTMLFormElement;
	beforeEach(() => {
		form = makeForm('<input name="a" value="orig"><input type="checkbox" name="b">');
	});

	it('is false when nothing changed', () => {
		expect(isDirty(form)).toBe(false);
	});

	it('is true after a text change', () => {
		form.querySelector<HTMLInputElement>('[name=a]')!.value = 'changed';
		expect(isDirty(form)).toBe(true);
	});

	it('is true after a checkbox change', () => {
		form.querySelector<HTMLInputElement>('[name=b]')!.checked = true;
		expect(isDirty(form)).toBe(true);
	});
});
