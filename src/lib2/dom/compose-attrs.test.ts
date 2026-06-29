import { describe, expect, it } from 'vitest';

import { apply, ca, concat, only, override } from '~/lib2/dom/compose-attrs';

describe('ca', () => {
	it('passes through non-conflicting keys', () => {
		expect(ca({ id: 'a' }, { role: 'tab' })).toEqual({ id: 'a', role: 'tab' });
	});

	it('skips null / undefined contributions', () => {
		expect(ca({ id: 'a', 'data-x': undefined }, null, undefined, { role: 'tab' })).toEqual({
			id: 'a',
			role: 'tab',
		});
	});

	it('throws on id conflict', () => {
		expect(() => ca({ id: 'a' }, { id: 'b' })).toThrow();
	});

	it('throws on role conflict', () => {
		expect(() => ca({ role: 'tab' }, { role: 'button' })).toThrow();
	});

	it('concats data-js with a space', () => {
		expect(ca({ 'data-js': 't-a' }, { 'data-js': 't-b' })).toEqual({ 'data-js': 't-a t-b' });
	});

	it('throws on arbitrary data-* conflict', () => {
		expect(() => ca({ 'data-target': 'a' }, { 'data-target': 'b' })).toThrow();
	});

	it('concats class', () => {
		expect(ca({ class: 'c-button' }, { class: 'o-input-box' })).toEqual({
			class: 'c-button o-input-box',
		});
	});

	it('concats aria-describedby and aria-labelledby', () => {
		expect(
			ca(
				{ 'aria-describedby': 'desc', 'aria-labelledby': 'lbl' },
				{ 'aria-describedby': 'err' },
			),
		).toEqual({ 'aria-describedby': 'desc err', 'aria-labelledby': 'lbl' });
	});

	it('joins style with a semicolon', () => {
		expect(ca({ style: 'color: red' }, { style: 'margin: 0' })).toEqual({
			style: 'color: red; margin: 0',
		});
	});

	it('throws on arbitrary key conflict', () => {
		expect(() => ca({ title: 'a' }, { title: 'b' })).toThrow();
	});
});

describe('wrappers', () => {
	it('only() is idempotent for the same value', () => {
		expect(ca({ 'data-target': only('p1') }, { 'data-target': only('p1') })).toEqual({
			'data-target': 'p1',
		});
	});

	it('only() throws against a different only() value', () => {
		expect(() => ca({ 'data-target': only('p1') }, { 'data-target': only('p2') })).toThrow();
	});

	it('only() throws against a plain contribution', () => {
		expect(() => ca({ 'data-target': only('p1') }, { 'data-target': 'p2' })).toThrow();
	});

	it('concat() joins with another concat()', () => {
		expect(ca({ 'data-js': concat('t-a') }, { 'data-js': concat('t-b') })).toEqual({
			'data-js': 't-a t-b',
		});
	});

	it('concat() throws when combined with only()', () => {
		expect(() => ca({ 'data-js': concat('t-a') }, { 'data-js': only('t-b') })).toThrow();
	});

	it('concat() throws when combined with override()', () => {
		expect(() => ca({ 'data-js': concat('t-a') }, { 'data-js': override('t-b') })).toThrow();
	});

	it('override() wins regardless of order', () => {
		expect(ca({ class: 'a' }, { class: override('b') })).toEqual({ class: 'b' });
		expect(ca({ class: override('b') }, { class: 'a' })).toEqual({ class: 'b' });
	});

	it('two override()s throw', () => {
		expect(() => ca({ class: override('a') }, { class: override('b') })).toThrow();
	});

	it('concat() forces join even on a throw-default key', () => {
		expect(ca({ 'data-x': concat('a') }, { 'data-x': concat('b') })).toEqual({
			'data-x': 'a b',
		});
	});
});

describe('apply', () => {
	it('sets, toggles, and removes attributes on a raw element', () => {
		const el = document.createElement('div');
		apply(el, { id: 'x', 'data-js': 't-a', hidden: true, title: false });
		expect(el.getAttribute('id')).toBe('x');
		expect(el.getAttribute('data-js')).toBe('t-a');
		expect(el.hasAttribute('hidden')).toBe(true);
		expect(el.hasAttribute('title')).toBe(false);
	});
});
