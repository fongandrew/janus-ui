import { describe, expect, it } from 'vitest';

import { ca, CombineAttrs, concat, only, override } from '~/lib2/dom/compose-attrs';

describe('ca', () => {
	it('throws on id conflict', () => {
		expect(() => ca({ id: 'a' }, { id: 'b' })).toThrow(/id/);
	});

	it('throws on id conflict even with the same value', () => {
		expect(() => ca({ id: 'a' }, { id: 'a' })).toThrow(/id/);
	});

	it('throws on role conflict', () => {
		expect(() => ca({ role: 'tab' }, { role: 'button' })).toThrow(/role/);
	});

	it('concats data-js with a space', () => {
		expect(ca({ 'data-js': 't-roving-focus' }, { 'data-js': 't-request-close' })).toEqual({
			'data-js': 't-roving-focus t-request-close',
		});
	});

	it('throws on arbitrary data-* conflict by default', () => {
		expect(() => ca({ 'data-target': 'a' }, { 'data-target': 'b' })).toThrow(/data-target/);
	});

	it('concats class', () => {
		expect(ca({ class: 'c-button' }, { class: 'v-colors-primary' })).toEqual({
			class: 'c-button v-colors-primary',
		});
	});

	it('concats aria-labelledby and aria-describedby', () => {
		expect(ca({ 'aria-labelledby': 'label-1' }, { 'aria-labelledby': 'label-2' })).toEqual({
			'aria-labelledby': 'label-1 label-2',
		});
		expect(ca({ 'aria-describedby': 'desc-1' }, { 'aria-describedby': 'desc-2' })).toEqual({
			'aria-describedby': 'desc-1 desc-2',
		});
	});

	it('joins style with a semicolon', () => {
		expect(ca({ style: 'color: red' }, { style: 'font-weight: 700' })).toEqual({
			style: 'color: red; font-weight: 700',
		});
	});

	it('passes through unrelated keys untouched', () => {
		expect(ca({ type: 'button' }, { disabled: true })).toEqual({
			type: 'button',
			disabled: true,
		});
	});

	it('skips undefined / null / false sources', () => {
		expect(ca({ class: 'a' }, undefined, null, false, { class: 'b' })).toEqual({
			class: 'a b',
		});
	});

	describe('only()', () => {
		it('is idempotent for a repeated identical value', () => {
			expect(
				ca({ 'data-target': only('panel-1') }, { 'data-target': only('panel-1') }),
			).toEqual({
				'data-target': 'panel-1',
			});
		});

		it('throws when only() values differ', () => {
			expect(() =>
				ca({ 'data-target': only('panel-1') }, { 'data-target': only('panel-2') }),
			).toThrow(/data-target/);
		});

		it('throws when only() meets a different wrapper', () => {
			expect(() =>
				ca({ 'data-target': only('a') }, { 'data-target': concat('a') }),
			).toThrow();
		});

		it('throws when only() meets a conflicting plain value', () => {
			expect(() => ca({ 'data-target': only('a') }, { 'data-target': 'b' })).toThrow();
		});

		it('is a no-op against a matching plain value', () => {
			expect(ca({ 'data-target': only('a') }, { 'data-target': 'a' })).toEqual({
				'data-target': 'a',
			});
		});
	});

	describe('concat()', () => {
		it('joins explicit concat() contributions', () => {
			expect(ca({ 'data-foo': concat('a') }, { 'data-foo': concat('b') })).toEqual({
				'data-foo': 'a b',
			});
		});

		it('pins concat mode even when the key default is throw, joining plain contributions too', () => {
			expect(ca({ 'data-foo': concat('a') }, { 'data-foo': 'b' })).toEqual({
				'data-foo': 'a b',
			});
		});

		it('throws when combined with only()', () => {
			expect(() => ca({ 'data-foo': concat('a') }, { 'data-foo': only('b') })).toThrow();
		});

		it('throws when combined with override()', () => {
			expect(() => ca({ 'data-foo': concat('a') }, { 'data-foo': override('b') })).toThrow();
		});
	});

	describe('override()', () => {
		it('wins over a plain contribution regardless of source order', () => {
			expect(ca({ 'data-foo': 'plain' }, { 'data-foo': override('forced') })).toEqual({
				'data-foo': 'forced',
			});
			expect(ca({ 'data-foo': override('forced') }, { 'data-foo': 'plain' })).toEqual({
				'data-foo': 'forced',
			});
		});

		it('throws when two override()s collide', () => {
			expect(() =>
				ca({ 'data-foo': override('a') }, { 'data-foo': override('b') }),
			).toThrow();
		});
	});

	it('mismatched wrapper types throw (concat vs override)', () => {
		expect(() =>
			ca({ 'aria-labelledby': concat('a') }, { 'aria-labelledby': override('b') }),
		).toThrow();
	});

	it('custom CombineAttrs honors its own rule map', () => {
		const customCa = new CombineAttrs({ 'p-foo': 'concat', '...': 'throw' }).combine;
		expect(customCa({ 'p-foo': 'a' }, { 'p-foo': 'b' })).toEqual({ 'p-foo': 'a b' });
		expect(() => customCa({ 'p-bar': 'a' }, { 'p-bar': 'b' })).toThrow();
	});
});
