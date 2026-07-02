import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
	addSubmitHandler,
	collectFormData,
	performSubmit,
	registerSubmitHandler,
	setFormError,
} from '~/lib2/dom/form/submit';

function setupForm(html: string, attrs = ''): HTMLFormElement {
	document.body.innerHTML = `<form ${attrs}>${html}</form>`;
	return document.querySelector('form')!;
}

describe('submit', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('dispatches to a named handler from data-submit-handler', async () => {
		const handler = vi.fn().mockResolvedValue({ ok: true });
		registerSubmitHandler('test-signup', handler);
		const form = setupForm(
			'<input name="email" value="a@b.c">',
			'data-submit-handler="test-signup"',
		);

		const result = await performSubmit(form, { validate: false });
		expect(result).toEqual({ ok: true });
		expect(handler).toHaveBeenCalledTimes(1);
		const data = handler.mock.calls[0]![0] as FormData;
		expect(data.get('email')).toBe('a@b.c');
	});

	it('prefers the WeakMap closure handler; cleanup removes it', async () => {
		registerSubmitHandler('test-named', vi.fn().mockResolvedValue({ ok: true }));
		const form = setupForm('<input name="x" value="1">', 'data-submit-handler="test-named"');
		const closure = vi.fn().mockResolvedValue({ ok: true });
		const cleanup = addSubmitHandler(form, closure);

		await performSubmit(form, { validate: false });
		expect(closure).toHaveBeenCalledTimes(1);
		cleanup();
		await performSubmit(form, { validate: false });
		expect(closure).toHaveBeenCalledTimes(1);
	});

	it('excludes aria-disabled fields from FormData without touching tab order', () => {
		const form = setupForm(
			'<input name="on" value="1"><input name="off" value="2" aria-disabled="true">',
		);
		const data = collectFormData(form);
		expect(data.get('on')).toBe('1');
		expect(data.get('off')).toBeNull();
		// the element is restored (still focusable / in tab order)
		const off = form.elements.namedItem('off') as HTMLInputElement;
		expect(off.disabled).toBe(false);
	});

	it('validation blocks the handler and focuses the first invalid field', async () => {
		const handler = vi.fn();
		const form = setupForm('<input name="req" required>', '');
		addSubmitHandler(form, handler);
		const result = await performSubmit(form, { validate: true });
		expect(result).toBeNull();
		expect(handler).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(form.elements.namedItem('req'));
	});

	it('applies fieldErrors and formError from a failed result', async () => {
		const form = setupForm(
			'<input name="email" aria-describedby="fe"><span id="fe" data-js="t-validate-error"></span>' +
				'<div data-form-error></div>',
		);
		addSubmitHandler(form, () => ({
			ok: false,
			fieldErrors: { email: 'Already in use' },
			formError: 'Fix the errors',
		}));
		await performSubmit(form, { validate: false });
		expect(document.getElementById('fe')!.textContent).toBe('Already in use');
		expect(form.querySelector('[data-form-error]')!.textContent).toBe('Fix the errors');
	});

	it('resets on success unless reset: false', async () => {
		const form = setupForm('<input name="x" value="">');
		const input = form.elements.namedItem('x') as HTMLInputElement;

		addSubmitHandler(form, () => ({ ok: true }));
		input.value = 'typed';
		await performSubmit(form, { validate: false });
		expect(input.value).toBe('');

		addSubmitHandler(form, () => ({ ok: true, reset: false }));
		input.value = 'kept';
		await performSubmit(form, { validate: false });
		expect(input.value).toBe('kept');
	});

	it('calls onSuccess after a successful submit', async () => {
		const form = setupForm('<input name="x">');
		addSubmitHandler(form, () => ({ ok: true }));
		const onSuccess = vi.fn();
		await performSubmit(form, { validate: false, onSuccess });
		expect(onSuccess).toHaveBeenCalledWith(form);
	});

	it('setFormError writes to the data-form-error destination', () => {
		const form = setupForm('<div data-form-error></div>');
		setFormError(form, 'Server exploded');
		const dest = form.querySelector('[data-form-error]')!;
		expect(dest.textContent).toBe('Server exploded');
		expect(dest.getAttribute('role')).toBe('alert');
	});
});
