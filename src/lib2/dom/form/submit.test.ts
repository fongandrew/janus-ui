import { afterEach, describe, expect, it, vi } from 'vitest';

import {
	addSubmitHandler,
	installFormEngine,
	registerSubmitHandler,
	type SubmitResult,
} from '~/lib2/dom/form/submit';

installFormEngine();

function makeForm(html: string, tokens = 't-validate t-submit'): HTMLFormElement {
	const form = document.createElement('form');
	form.setAttribute('data-js', tokens);
	form.innerHTML = html;
	document.body.append(form);
	return form;
}

/** jsdom does not implement form submission; dispatch a cancelable submit event. */
function submit(form: HTMLFormElement): void {
	form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('submit choreography', () => {
	it('blocks the handler when validation fails', async () => {
		const handler = vi.fn(async (): Promise<SubmitResult> => ({ ok: true }));
		const form = makeForm('<input name="a" required>');
		addSubmitHandler(form, handler);
		submit(form);
		await Promise.resolve();
		expect(handler).not.toHaveBeenCalled();
	});

	it('calls the handler with FormData when valid', async () => {
		const handler = vi.fn(async (data: FormData): Promise<SubmitResult> => {
			expect(data.get('a')).toBe('hello');
			return { ok: true };
		});
		const form = makeForm('<input name="a" value="hello">');
		addSubmitHandler(form, handler);
		submit(form);
		await new Promise((r) => setTimeout(r, 0));
		expect(handler).toHaveBeenCalledOnce();
	});

	it('excludes aria-disabled fields from FormData', async () => {
		let seen: FormData | undefined;
		const form = makeForm(
			'<input name="a" value="x"><input name="b" value="y" aria-disabled="true">',
		);
		addSubmitHandler(form, async (data): Promise<SubmitResult> => {
			seen = data;
			return { ok: true };
		});
		submit(form);
		await new Promise((r) => setTimeout(r, 0));
		expect(seen?.get('a')).toBe('x');
		expect(seen?.has('b')).toBe(false);
	});

	it('writes server-fed field errors on { ok: false }', async () => {
		const form = makeForm(
			'<input id="email" name="email" value="a@b.com" aria-describedby="email-err">' +
				'<span id="email-err" data-js="t-validate-error"></span>',
		);
		addSubmitHandler(
			form,
			async (): Promise<SubmitResult> => ({
				ok: false,
				fieldErrors: { email: 'Already in use' },
			}),
		);
		submit(form);
		await new Promise((r) => setTimeout(r, 0));
		expect(document.getElementById('email-err')?.textContent).toBe('Already in use');
	});

	it('resolves a named submit handler from data-submit-handler', async () => {
		const handler = vi.fn(async (): Promise<SubmitResult> => ({ ok: true }));
		registerSubmitHandler('named-test', handler);
		const form = makeForm('<input name="a" value="x">');
		form.setAttribute('data-submit-handler', 'named-test');
		submit(form);
		await new Promise((r) => setTimeout(r, 0));
		expect(handler).toHaveBeenCalledOnce();
	});
});
