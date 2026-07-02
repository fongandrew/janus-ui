import { describe, expect, it } from 'vitest';

import { generateEntry, resolveHandlerTokens, scanTokens } from './vite-plugin-janus-bundle';

describe('scanTokens', () => {
	it('extracts space-separated behavior tokens from data-js attributes', () => {
		const html =
			'<form data-js="t-validate t-submit"><div data-js=\'c-modal__close\'></div></form>';
		expect([...scanTokens(html)].sort()).toEqual(['c-modal__close', 't-submit', 't-validate']);
	});

	it('ignores sidecar attributes and non-prefixed tokens', () => {
		const html = '<input data-validators="no-bob" data-js="t-validate custom-thing">';
		expect([...scanTokens(html)]).toEqual(['t-validate']);
	});

	it('scans JS output (SSR-rendered strings) too', () => {
		const js = 'el.innerHTML = `<div data-js="t-roving-focus">`;';
		expect([...scanTokens(js)]).toEqual(['t-roving-focus']);
	});

	it('respects a configured attribute name', () => {
		const html = '<div data-foo="t-open-tab" data-js="t-ignored-here">';
		expect([...scanTokens(html, 'data-foo')]).toEqual(['t-open-tab']);
	});
});

describe('resolveHandlerTokens', () => {
	it('keeps only tokens with a matching handler file (filename-as-manifest)', () => {
		const resolved = resolveHandlerTokens(
			['t-roving-focus', 't-validate', 'c-modal__close', 't-does-not-exist', 'p-consumer'],
			'src/lib2/dom/handlers',
		);
		expect(resolved).toEqual(['c-modal__close', 't-roving-focus', 't-validate']);
	});
});

describe('generateEntry', () => {
	it('emits one side-effect import per handler', () => {
		const entry = generateEntry(['t-validate', 'c-modal__close'], '~/lib2/dom/handlers');
		expect(entry).toContain("import '~/lib2/dom/handlers/t-validate';");
		expect(entry).toContain("import '~/lib2/dom/handlers/c-modal__close';");
	});

	it('emits an empty module when nothing was referenced', () => {
		expect(generateEntry([], '~/lib2/dom/handlers')).toContain('export {}');
	});
});
