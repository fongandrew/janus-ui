import { describe, expect, it } from 'vitest';

import { ca, concat, only, override, CombineAttrs } from './compose-attrs';

describe('ca', () => {
	it('merges non-conflicting attributes', () => {
		expect(ca({ id: 'a' }, { class: 'btn' })).toEqual({ id: 'a', class: 'btn' });
	});

	it('concats data-js by default', () => {
		expect(ca({ 'data-js': 't-roving-focus' }, { 'data-js': 't-request-close' })).toEqual({
			'data-js': 't-roving-focus t-request-close',
		});
	});

	it('concats class by default', () => {
		expect(ca({ class: 'a' }, { class: 'b' })).toEqual({ class: 'a b' });
	});

	it('concats aria-describedby', () => {
		expect(ca({ 'aria-describedby': 'a' }, { 'aria-describedby': 'b' })).toEqual({
			'aria-describedby': 'a b',
		});
	});

	it('throws on id conflict', () => {
		expect(() => ca({ id: 'a' }, { id: 'b' })).toThrow();
	});

	it('throws on role conflict', () => {
		expect(() => ca({ role: 'button' }, { role: 'tab' })).toThrow();
	});

	it('throws on data-* conflict (non data-js)', () => {
		expect(() => ca({ 'data-target': 'a' }, { 'data-target': 'b' })).toThrow();
	});

	it('skips undefined sources', () => {
		expect(ca(undefined, { id: 'a' }, null, false)).toEqual({ id: 'a' });
	});

	it('skips undefined values', () => {
		expect(ca({ id: 'a', class: undefined })).toEqual({ id: 'a' });
	});
});

describe('only', () => {
	it('accepts single value', () => {
		expect(ca({ 'data-target': only('panel-1') })).toEqual({ 'data-target': 'panel-1' });
	});

	it('is idempotent with same value', () => {
		expect(ca({ 'data-target': only('x') }, { 'data-target': only('x') })).toEqual({
			'data-target': 'x',
		});
	});

	it('throws on different only values', () => {
		expect(() => ca({ 'data-target': only('a') }, { 'data-target': only('b') })).toThrow();
	});

	it('throws when mixed with concat', () => {
		expect(() => ca({ 'data-js': only('a') }, { 'data-js': concat('b') })).toThrow();
	});
});

describe('concat', () => {
	it('joins multiple values', () => {
		expect(ca({ 'data-js': concat('a') }, { 'data-js': concat('b') })).toEqual({
			'data-js': 'a b',
		});
	});

	it('throws when mixed with only', () => {
		expect(() => ca({ 'data-js': concat('a') }, { 'data-js': only('b') })).toThrow();
	});
});

describe('override', () => {
	it('wins regardless of order', () => {
		expect(ca({ class: 'a' }, { class: override('b') })).toEqual({ class: 'b' });
	});

	it('throws on two overrides', () => {
		expect(() => ca({ class: override('a') }, { class: override('b') })).toThrow();
	});
});

describe('CombineAttrs custom config', () => {
	it('allows custom default resolution', () => {
		const custom = new CombineAttrs({ 'data-*': 'concat', '...': 'throw' });
		expect(custom.combine({ 'data-x': 'a' }, { 'data-x': 'b' })).toEqual({
			'data-x': 'a b',
		});
	});
});
