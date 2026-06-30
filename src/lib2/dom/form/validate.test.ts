import { afterEach, describe, expect, it } from 'vitest';

import {
	_resetValidateForTests,
	addValidator,
	isTouched,
	registerValidator,
	setErrors,
	setFormError,
	validateForm,
} from '~/lib2/dom/form/validate';

function fireChange(el: Element): void {
	el.dispatchEvent(new Event('change', { bubbles: true }));
}

function fireInput(el: Element): void {
	el.dispatchEvent(new Event('input', { bubbles: true }));
}

function field(id: string): HTMLInputElement {
	return document.getElementById(id) as HTMLInputElement;
}

afterEach(() => {
	_resetValidateForTests();
	document.body.innerHTML = '';
});

describe('form validation', () => {
	it('runs a named validator referenced via data-validators', () => {
		registerValidator('no-bob', (el) =>
			(el as HTMLInputElement).value.includes('bob') ? 'No Bobs allowed' : null,
		);
		document.body.innerHTML = `
			<form data-js="t-validate">
				<input id="name" name="name" data-validators="no-bob" aria-describedby="name-err">
				<span id="name-err" data-js="t-validate-error"></span>
			</form>
		`;
		field('name').value = 'bob';
		fireChange(field('name'));

		expect(document.getElementById('name-err')!.textContent).toBe('No Bobs allowed');
		expect(field('name').getAttribute('aria-invalid')).toBe('true');
	});

	it('runs an inline validator attached via addValidator (WeakMap path)', () => {
		document.body.innerHTML = `
			<form data-js="t-validate">
				<input id="name" name="name" aria-describedby="name-err">
				<span id="name-err" data-js="t-validate-error"></span>
			</form>
		`;
		addValidator(field('name'), (el) => (el.value === 'taken' ? 'Already taken' : null));
		field('name').value = 'taken';
		fireChange(field('name'));

		expect(document.getElementById('name-err')!.textContent).toBe('Already taken');
	});

	it('clears the error once the field is fixed', () => {
		registerValidator('no-bob', (el) =>
			(el as HTMLInputElement).value.includes('bob') ? 'No Bobs allowed' : null,
		);
		document.body.innerHTML = `
			<form data-js="t-validate">
				<input id="name" name="name" data-validators="no-bob" aria-describedby="name-err">
				<span id="name-err" data-js="t-validate-error"></span>
			</form>
		`;
		field('name').value = 'bob';
		fireChange(field('name'));
		expect(document.getElementById('name-err')!.textContent).toBe('No Bobs allowed');

		field('name').value = 'alice';
		fireChange(field('name'));
		expect(document.getElementById('name-err')!.textContent).toBe('');
		expect(field('name').hasAttribute('aria-invalid')).toBe(false);
	});

	it('does not show errors on untouched fields when a sibling changes', () => {
		document.body.innerHTML = `
			<form data-js="t-validate">
				<input id="a" name="a">
				<input id="b" name="b" required aria-describedby="b-err">
				<span id="b-err" data-js="t-validate-error"></span>
			</form>
		`;
		expect(isTouched(field('b'))).toBe(false);
		fireChange(field('a'));

		expect(isTouched(field('b'))).toBe(false);
		expect(document.getElementById('b-err')!.textContent).toBe('');
	});

	it('switches to input-event validation after a field has shown an error', () => {
		document.body.innerHTML = `
			<form data-js="t-validate">
				<input id="name" name="name" required aria-describedby="name-err">
				<span id="name-err" data-js="t-validate-error"></span>
			</form>
		`;
		fireChange(field('name')); // touches, shows "required" error
		expect(document.getElementById('name-err')!.textContent).not.toBe('');

		field('name').value = 'now filled in';
		fireInput(field('name')); // live feedback via `input`, not `change`
		expect(document.getElementById('name-err')!.textContent).toBe('');
	});

	it('re-validates every other touched member of a t-validate-group on change', () => {
		registerValidator('after-start', (el) => {
			const form = (el as HTMLInputElement).form!;
			const start = (form.elements.namedItem('start') as HTMLInputElement).value;
			return (el as HTMLInputElement).value < start ? 'Must be after start' : null;
		});
		document.body.innerHTML = `
			<form data-js="t-validate">
				<fieldset data-js="t-validate-group">
					<input id="start" name="start" type="date" value="2026-01-10">
					<input id="end" name="end" type="date" value="2026-01-01" data-validators="after-start" aria-describedby="end-err">
					<span id="end-err" data-js="t-validate-error"></span>
				</fieldset>
			</form>
		`;
		// Touch `end` first so it's eligible for group re-validation.
		fireChange(field('end'));
		expect(document.getElementById('end-err')!.textContent).toBe('Must be after start');

		// Fixing `start` should re-trigger validation on the already-touched `end`.
		field('start').value = '2025-01-01';
		fireChange(field('start'));
		expect(document.getElementById('end-err')!.textContent).toBe('');
	});

	it('ignores aria-disabled fields', () => {
		document.body.innerHTML = `
			<form data-js="t-validate">
				<input id="name" name="name" required aria-disabled="true" aria-describedby="name-err">
				<span id="name-err" data-js="t-validate-error"></span>
			</form>
		`;
		fireChange(field('name'));
		expect(document.getElementById('name-err')!.textContent).toBe('');
	});

	describe('setErrors / setFormError', () => {
		it('writes server-fed field errors keyed by name, and clears on next change', () => {
			document.body.innerHTML = `
				<form id="f" data-js="t-validate">
					<input id="email" name="email" aria-describedby="email-err">
					<span id="email-err" data-js="t-validate-error"></span>
				</form>
			`;
			const form = document.getElementById('f') as HTMLFormElement;
			setErrors(form, { email: 'Already taken' });
			expect(document.getElementById('email-err')!.textContent).toBe('Already taken');

			field('email').value = 'new@example.com';
			fireChange(field('email'));
			expect(document.getElementById('email-err')!.textContent).toBe('');
		});

		it('writes a form-wide error via data-form-error', () => {
			document.body.innerHTML = `
				<form id="f" data-js="t-validate">
					<div data-js="t-validate-error" data-form-error></div>
				</form>
			`;
			const form = document.getElementById('f') as HTMLFormElement;
			setFormError(form, 'Something went wrong');
			expect(form.querySelector('[data-form-error]')!.textContent).toBe(
				'Something went wrong',
			);
		});
	});

	it('validateForm() reveals errors for touched fields and reports overall validity', () => {
		document.body.innerHTML = `
			<form id="f" data-js="t-validate">
				<input id="a" name="a" required aria-describedby="a-err">
				<span id="a-err" data-js="t-validate-error"></span>
			</form>
		`;
		const form = document.getElementById('f') as HTMLFormElement;
		expect(validateForm(form)).toBe(false);
		// Untouched, so the message isn't revealed yet.
		expect(document.getElementById('a-err')!.textContent).toBe('');
	});
});
