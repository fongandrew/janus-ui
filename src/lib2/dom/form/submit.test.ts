import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	_resetSubmitForTests,
	addSubmitHandler,
	registerSubmitHandler,
	type SubmitResult,
} from '~/lib2/dom/form/submit';
import { _resetValidateForTests, setErrors } from '~/lib2/dom/form/validate';

function submitForm(form: HTMLFormElement): void {
	// jsdom doesn't implement HTMLFormElement.requestSubmit(); dispatch a
	// cancelable `submit` event directly, matching what a real submit click does.
	form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

async function flush(): Promise<void> {
	await Promise.resolve();
	await Promise.resolve();
}

afterEach(() => {
	_resetSubmitForTests();
	_resetValidateForTests();
	document.body.innerHTML = '';
});

describe('form submit', () => {
	it('dispatches to a named handler registered via registerSubmitHandler', async () => {
		const handler = vi.fn<(data: FormData, form: HTMLFormElement) => SubmitResult>(() => ({
			ok: true,
		}));
		registerSubmitHandler('signup', handler);
		document.body.innerHTML = `
			<form id="f" data-js="t-submit" data-submit-handler="signup">
				<input name="email" value="a@example.com">
			</form>
		`;
		const form = document.getElementById('f') as HTMLFormElement;
		submitForm(form);
		await flush();

		expect(handler).toHaveBeenCalledTimes(1);
		const [data, formArg] = handler.mock.calls[0]!;
		expect(data.get('email')).toBe('a@example.com');
		expect(formArg).toBe(form);
	});

	it('dispatches to a closure handler registered via addSubmitHandler', async () => {
		const handler = vi.fn<(data: FormData, form: HTMLFormElement) => SubmitResult>(() => ({
			ok: true,
		}));
		document.body.innerHTML = `<form id="f" data-js="t-submit"></form>`;
		const form = document.getElementById('f') as HTMLFormElement;
		addSubmitHandler(form, handler);
		submitForm(form);
		await flush();

		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('excludes aria-disabled fields from FormData', async () => {
		let captured: FormData | undefined;
		registerSubmitHandler('capture', (data) => {
			captured = data;
			return { ok: true };
		});
		document.body.innerHTML = `
			<form id="f" data-js="t-submit" data-submit-handler="capture">
				<input name="active" value="yes">
				<input name="inactive" value="no" aria-disabled="true">
			</form>
		`;
		submitForm(document.getElementById('f') as HTMLFormElement);
		await flush();

		expect(captured!.get('active')).toBe('yes');
		expect(captured!.has('inactive')).toBe(false);
	});

	it('blocks submission and reveals errors when t-validate fails', async () => {
		const handler = vi.fn<(data: FormData, form: HTMLFormElement) => SubmitResult>(() => ({
			ok: true,
		}));
		registerSubmitHandler('signup', handler);
		document.body.innerHTML = `
			<form id="f" data-js="t-validate t-submit" data-submit-handler="signup">
				<input id="email" name="email" required aria-describedby="email-err">
				<span id="email-err" data-js="t-validate-error"></span>
			</form>
		`;
		submitForm(document.getElementById('f') as HTMLFormElement);
		await flush();

		expect(handler).not.toHaveBeenCalled();
		expect(document.getElementById('email-err')!.textContent).not.toBe('');
	});

	it('writes fieldErrors and formError from a failed result via setErrors / setFormError', async () => {
		registerSubmitHandler('signup', () => ({
			ok: false,
			fieldErrors: { email: 'Already in use' },
			formError: 'Please fix the errors below',
		}));
		document.body.innerHTML = `
			<form id="f" data-js="t-submit" data-submit-handler="signup">
				<input id="email" name="email" aria-describedby="email-err">
				<span id="email-err" data-js="t-validate-error"></span>
				<div data-js="t-validate-error" data-form-error></div>
			</form>
		`;
		const form = document.getElementById('f') as HTMLFormElement;
		submitForm(form);
		await flush();

		expect(document.getElementById('email-err')!.textContent).toBe('Already in use');
		expect(form.querySelector('[data-form-error]')!.textContent).toBe(
			'Please fix the errors below',
		);
	});

	it('resets the form on a successful submit by default', async () => {
		registerSubmitHandler('signup', () => ({ ok: true }));
		document.body.innerHTML = `
			<form id="f" data-js="t-submit" data-submit-handler="signup">
				<input id="email" name="email" value="a@example.com">
			</form>
		`;
		const form = document.getElementById('f') as HTMLFormElement;
		const resetSpy = vi.spyOn(form, 'reset');
		submitForm(form);
		await flush();

		expect(resetSpy).toHaveBeenCalledTimes(1);
	});

	it('does not reset when the handler returns reset: false', async () => {
		registerSubmitHandler('signup', () => ({ ok: true, reset: false }));
		document.body.innerHTML = `<form id="f" data-js="t-submit" data-submit-handler="signup"></form>`;
		const form = document.getElementById('f') as HTMLFormElement;
		const resetSpy = vi.spyOn(form, 'reset');
		submitForm(form);
		await flush();

		expect(resetSpy).not.toHaveBeenCalled();
	});

	it('exposes setErrors directly for non-submit-flow server feedback', () => {
		document.body.innerHTML = `
			<form id="f" data-js="t-validate">
				<input id="email" name="email" aria-describedby="email-err">
				<span id="email-err" data-js="t-validate-error"></span>
			</form>
		`;
		setErrors(document.getElementById('f') as HTMLFormElement, { email: 'Reserved' });
		expect(document.getElementById('email-err')!.textContent).toBe('Reserved');
	});
});
