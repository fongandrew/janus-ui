import { describe, expect, it } from 'vitest';

import { generateHandlerEntry, scanDataJsTokens } from './vite-plugin-janus-bundle';

describe('scanDataJsTokens', () => {
	it('extracts and de-duplicates behavior tokens from data-js values', () => {
		const html = `
			<div data-js="t-roving-focus c-tabs__select"></div>
			<dialog data-js="t-request-close t-restore-focus"></dialog>
			<span data-js="t-roving-focus"></span>
		`;
		const tokens = scanDataJsTokens(html);
		expect([...tokens].sort()).toEqual([
			'c-tabs__select',
			't-request-close',
			't-restore-focus',
			't-roving-focus',
		]);
	});

	it('respects a custom attribute name', () => {
		const html = `<div data-foo="t-x"></div><div data-js="t-y"></div>`;
		expect([...scanDataJsTokens(html, 'data-foo')]).toEqual(['t-x']);
	});

	it('returns empty for content with no behavior tokens', () => {
		expect(scanDataJsTokens('<div class="c-card"></div>').size).toBe(0);
	});
});

describe('generateHandlerEntry', () => {
	it('imports only tokens with an existing handler module, sorted', () => {
		const known = new Set(['t-roving-focus', 't-request-close']);
		const entry = generateHandlerEntry(
			['t-request-close', 't-roving-focus', 't-nonexistent'],
			(name) => known.has(name),
		);
		expect(entry).toContain("import '~/lib2/dom/handlers/t-request-close';");
		expect(entry).toContain("import '~/lib2/dom/handlers/t-roving-focus';");
		expect(entry).not.toContain('t-nonexistent');
		// Sorted order.
		expect(entry.indexOf('t-request-close')).toBeLessThan(entry.indexOf('t-roving-focus'));
	});

	it('honors a custom import base', () => {
		const entry = generateHandlerEntry(['t-x'], () => true, '@app/handlers');
		expect(entry).toContain("import '@app/handlers/t-x';");
	});
});
