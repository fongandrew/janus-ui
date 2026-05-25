import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerSubmitHandler, addSubmitHandler, handleSubmit } from './submit';

describe('submit', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('registerSubmitHandler + handleSubmit calls handler', async () => {
		const handler = vi.fn().mockResolvedValue({ ok: true });
		registerSubmitHandler('test-handler', handler);

		const form = document.createElement('form');
		form.setAttribute('data-submit-handler', 'test-handler');
		const input = document.createElement('input');
		input.name = 'email';
		input.value = 'test@example.com';
		form.appendChild(input);
		document.body.appendChild(form);

		await handleSubmit(form);
		expect(handler).toHaveBeenCalled();
		const [data] = handler.mock.calls[0]!;
		expect(data.get('email')).toBe('test@example.com');
	});

	it('addSubmitHandler uses WeakMap path', async () => {
		const handler = vi.fn().mockResolvedValue({ ok: true });
		const form = document.createElement('form');
		document.body.appendChild(form);

		addSubmitHandler(form, handler);
		await handleSubmit(form);
		expect(handler).toHaveBeenCalled();
	});

	it('filters aria-disabled elements from FormData', async () => {
		const handler = vi.fn().mockResolvedValue({ ok: true });
		registerSubmitHandler('test-filter', handler);

		const form = document.createElement('form');
		form.setAttribute('data-submit-handler', 'test-filter');
		const active = document.createElement('input');
		active.name = 'active';
		active.value = 'yes';
		const disabled = document.createElement('input');
		disabled.name = 'disabled';
		disabled.value = 'no';
		disabled.setAttribute('aria-disabled', 'true');
		form.appendChild(active);
		form.appendChild(disabled);
		document.body.appendChild(form);

		await handleSubmit(form);
		const [data] = handler.mock.calls[0]!;
		expect(data.get('active')).toBe('yes');
		expect(data.get('disabled')).toBeNull();
	});

	it('dispatches success event on ok result', async () => {
		const handler = vi.fn().mockResolvedValue({ ok: true });
		const form = document.createElement('form');
		document.body.appendChild(form);
		addSubmitHandler(form, handler);

		const successFn = vi.fn();
		form.addEventListener('janus:submit-success', successFn);

		await handleSubmit(form);
		expect(successFn).toHaveBeenCalled();
	});

	it('dispatches error event on failed result', async () => {
		const handler = vi.fn().mockResolvedValue({
			ok: false,
			formError: 'Server error',
		});
		const form = document.createElement('form');
		const errEl = document.createElement('div');
		errEl.setAttribute('data-js', 't-form-error');
		form.appendChild(errEl);
		document.body.appendChild(form);
		addSubmitHandler(form, handler);

		const errorFn = vi.fn();
		form.addEventListener('janus:submit-error', errorFn);

		await handleSubmit(form);
		expect(errorFn).toHaveBeenCalled();
		expect(errEl.textContent).toBe('Server error');
	});
});
