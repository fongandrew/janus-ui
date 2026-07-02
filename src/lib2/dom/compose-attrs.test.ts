import { describe, expect, it } from 'vitest';

import { ca, CombineAttrs, concat, only, override } from '~/lib2/dom/compose-attrs';

describe('ca / CombineAttrs', () => {
	it('passes a single source through', () => {
		expect(ca({ role: 'tab', id: 'x' })).toEqual({ role: 'tab', id: 'x' });
	});

	it('concats data-js', () => {
		expect(ca({ 'data-js': 'a' }, { 'data-js': 'b' })).toEqual({ 'data-js': 'a b' });
	});

	it('concats class and aria references', () => {
		expect(ca({ class: 'a' }, { class: 'b' })).toEqual({ class: 'a b' });
		expect(ca({ 'aria-describedby': 'x' }, { 'aria-describedby': 'y' })).toEqual({
			'aria-describedby': 'x y',
		});
	});

	it('throws on id / role conflict', () => {
		expect(() => ca({ id: 'a' }, { id: 'b' })).toThrow();
		expect(() => ca({ role: 'a' }, { role: 'b' })).toThrow();
	});

	it('throws on data-* conflict by default', () => {
		expect(() => ca({ 'data-x': '1' }, { 'data-x': '2' })).toThrow();
	});

	it('throws on unknown attribute conflict', () => {
		expect(() => ca({ foo: '1' }, { foo: '2' })).toThrow();
	});

	it('only() is idempotent for the same value', () => {
		expect(ca({ 'data-x': only('a') }, { 'data-x': only('a') })).toEqual({ 'data-x': 'a' });
	});

	it('only() throws when combined with another value or wrapper', () => {
		expect(() => ca({ 'data-x': only('a') }, { 'data-x': 'b' })).toThrow();
		expect(() => ca({ 'data-x': only('a') }, { 'data-x': concat('b') })).toThrow();
		expect(() => ca({ 'data-x': only('a') }, { 'data-x': only('b') })).toThrow();
	});

	it('override() wins regardless of order; two throw', () => {
		expect(ca({ 'data-js': concat('a') }, { 'data-js': override('b') })).toEqual({
			'data-js': 'b',
		});
		expect(() => ca({ 'data-js': override('a') }, { 'data-js': override('b') })).toThrow();
	});

	it('concat() composes with the default concat rule', () => {
		expect(ca({ 'data-js': concat('t-x') }, { 'data-js': 'y' })).toEqual({ 'data-js': 't-x y' });
	});

	it('a single only() passes its value through', () => {
		expect(ca({ 'data-target': only('p1') })).toEqual({ 'data-target': 'p1' });
	});

	it('honors a custom conflict map', () => {
		const custom = new CombineAttrs({ 'data-x': 'concat', '...': 'throw' });
		expect(custom.combine({ 'data-x': '1' }, { 'data-x': '2' })).toEqual({ 'data-x': '1 2' });
	});
});
