import { describe, expect, it } from 'vitest';

import { apply, ca, CombineAttrs, concat, only, override } from '~/lib2/dom/compose-attrs';

describe('ca', () => {
	it('passes through single contributions', () => {
		expect(ca({ id: 'x', class: 'a' })).toEqual({ id: 'x', class: 'a' });
	});

	it('skips undefined/null values', () => {
		expect(ca({ id: undefined, class: 'a' }, { title: null })).toEqual({ class: 'a' });
	});

	it('throws on duplicate id and role', () => {
		expect(() => ca({ id: 'a' }, { id: 'b' })).toThrow();
		expect(() => ca({ role: 'tab' }, { role: 'button' })).toThrow();
	});

	it('concats data-js with a space', () => {
		expect(ca({ 'data-js': 't-a' }, { 'data-js': 't-b' })).toEqual({ 'data-js': 't-a t-b' });
	});

	it('throws on other data-* conflicts', () => {
		expect(() => ca({ 'data-target': 'a' }, { 'data-target': 'b' })).toThrow();
	});

	it('concats class and ARIA reference lists', () => {
		expect(ca({ class: 'a' }, { class: 'b' })).toEqual({ class: 'a b' });
		expect(ca({ 'aria-labelledby': 'x' }, { 'aria-labelledby': 'y' })).toEqual({
			'aria-labelledby': 'x y',
		});
		expect(ca({ 'aria-describedby': 'x' }, { 'aria-describedby': 'y' })).toEqual({
			'aria-describedby': 'x y',
		});
	});

	it('concats style with a semicolon', () => {
		expect(ca({ style: 'color: red' }, { style: 'top: 0' })).toEqual({
			style: 'color: red; top: 0',
		});
	});

	it('throws on unknown attribute conflicts', () => {
		expect(() => ca({ title: 'a' }, { title: 'b' })).toThrow();
	});

	describe('wrappers', () => {
		it('only() is idempotent for equal values and throws otherwise', () => {
			expect(ca({ 'data-target': only('x') }, { 'data-target': only('x') })).toEqual({
				'data-target': 'x',
			});
			expect(() => ca({ 'data-target': only('x') }, { 'data-target': only('y') })).toThrow();
			expect(() =>
				ca({ 'data-target': only('x') }, { 'data-target': concat('x') }),
			).toThrow();
		});

		it('concat() joins across sources, including plain strings', () => {
			expect(ca({ 'data-js': concat('t-a') }, { 'data-js': 't-user' })).toEqual({
				'data-js': 't-a t-user',
			});
			expect(ca({ id: concat('a') }, { id: concat('b') })).toEqual({ id: 'a b' });
		});

		it('override() wins regardless of order; two overrides throw', () => {
			expect(ca({ class: override('winner') }, { class: 'loser' })).toEqual({
				class: 'winner',
			});
			expect(ca({ class: 'loser' }, { class: override('winner') })).toEqual({
				class: 'winner',
			});
			expect(() => ca({ class: override('a') }, { class: override('b') })).toThrow();
		});

		it('mismatched wrappers throw', () => {
			expect(() => ca({ class: concat('a') }, { class: override('b') })).toThrow();
			expect(() => ca({ class: only('a') }, { class: override('a') })).toThrow();
		});
	});

	it('supports custom default maps via the factory', () => {
		const custom = new CombineAttrs({ 'data-x-*': 'concat', '...': 'override' });
		expect(custom.combine({ 'data-x-a': '1' }, { 'data-x-a': '2' })).toEqual({
			'data-x-a': '1 2',
		});
		expect(custom.combine({ title: 'a' }, { title: 'b' })).toEqual({ title: 'b' });
	});

	it('apply() writes attributes onto a DOM element', () => {
		const el = document.createElement('div');
		apply(el, ca({ 'data-js': concat('t-a') }, { class: 'x' }));
		expect(el.getAttribute('data-js')).toBe('t-a');
		expect(el.className).toBe('x');
	});
});
