import { beforeEach, describe, expect, it } from 'vitest';

import {
	addSubmitHandler,
	buildFormData,
	getSubmitHandler,
	isDirty,
	registerSubmitHandler,
} from '~/lib2/dom/form/submit';

describe('form submit', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
	});

	it('buildFormData excludes aria-disabled fields', () => {
		document.body.innerHTML =
			'<form><input name="a" value="1"><input name="b" value="2" aria-disabled="true"></form>';
		const form = document.querySelector('form')!;
		const data = buildFormData(form);
		expect(data.get('a')).toBe('1');
		expect(data.get('b')).toBeNull();
	});

	it('resolves a named submit handler from data-submit-handler', () => {
		const fn = async () => ({ ok: true }) as const;
		registerSubmitHandler('signup', fn);
		document.body.innerHTML = '<form data-submit-handler="signup"></form>';
		expect(getSubmitHandler(document.querySelector('form')!)).toBe(fn);
	});

	it('prefers an inline submit handler over a named one', () => {
		const named = async () => ({ ok: true }) as const;
		const inline = async () => ({ ok: true }) as const;
		registerSubmitHandler('x', named);
		document.body.innerHTML = '<form data-submit-handler="x"></form>';
		const form = document.querySelector('form')!;
		addSubmitHandler(form, inline);
		expect(getSubmitHandler(form)).toBe(inline);
	});

	it('isDirty reflects value changes from defaults', () => {
		document.body.innerHTML = '<form><input name="a" value="start"></form>';
		const form = document.querySelector('form')!;
		expect(isDirty(form)).toBe(false);
		(form.elements.namedItem('a') as HTMLInputElement).value = 'changed';
		expect(isDirty(form)).toBe(true);
	});

	it('isDirty detects checkbox changes', () => {
		document.body.innerHTML = '<form><input type="checkbox" name="c"></form>';
		const form = document.querySelector('form')!;
		expect(isDirty(form)).toBe(false);
		(form.elements.namedItem('c') as HTMLInputElement).checked = true;
		expect(isDirty(form)).toBe(true);
	});
});
