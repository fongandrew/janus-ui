import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTextMatcher } from './create-text-matcher';

interface TextNode {
	text: string;
}

describe('createTextMatcher', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	const setupNodes = (...texts: string[]): TextNode[] => texts.map((text) => ({ text }));

	const getText = (node: TextNode) => node.text;

	it('should match text content in nodes', () => {
		const nodes = setupNodes('Apple', 'Banana', 'Orange');
		const matcher = createTextMatcher(() => nodes, { getText });

		const node = matcher('Ban');
		expect(node).toBe(nodes[1]);
	});

	it('should accumulate characters within delay window', () => {
		const nodes = setupNodes('Apple', 'Apricot', 'Avocado');
		const matcher = createTextMatcher(() => nodes, { getText });

		// Type 'Apr' within delay window
		let node = matcher('A');
		expect(node).toBe(nodes[0]);
		node = matcher('p');
		expect(node).toBe(nodes[0]);
		node = matcher('r');
		expect(node).toBe(nodes[1]);
	});

	it('should match on any substring', () => {
		const nodes = setupNodes('Apple', 'Apricot', 'Avocado');
		const matcher = createTextMatcher(() => nodes, { getText });

		const node = matcher('cot');
		expect(node).toBe(nodes[1]);
	});

	it('should prefer matches that start with string over substring', () => {
		const nodes = setupNodes('Apricot', 'Avocado', 'Cotton Candy');
		const matcher = createTextMatcher(() => nodes, { getText });

		const node = matcher('cot');
		expect(node).toBe(nodes[2]);
	});

	it('should reset text after delay window', () => {
		const nodes = setupNodes('Apple', 'Apricot', 'Avocado');
		const matcher = createTextMatcher(() => nodes, { getText });

		// Type 'A' within delay window
		let node = matcher('A');
		expect(node).toBe(nodes[0]);

		// Wait for delay window and type 'Av'
		vi.advanceTimersByTime(500);
		node = matcher('A');
		expect(node).toBe(nodes[0]);
		node = matcher('v');
		expect(node).toBe(nodes[2]);
	});

	it('should compare normalized text', () => {
		const nodes = setupNodes('Apple', 'Apricot', 'Avocado');
		const matcher = createTextMatcher(() => nodes, { getText });

		const node = matcher('  apr');
		expect(node).toBe(nodes[1]);
	});

	it('should cache normalized text during delay window', () => {
		const nodes = setupNodes('Apple', 'Avocado');
		const matcher = createTextMatcher(() => nodes, { getText });

		let node = matcher('a');
		expect(node).toBe(nodes[0]);

		// Modify text content so it no longer matches
		nodes[0]!.text = 'Banana';

		// Still matches because cached
		node = matcher('p');
		expect(node).toBe(nodes[0]);
	});

	it('should clear cache after delay window', () => {
		const nodes = setupNodes('Apple', 'Avocado');
		const matcher = createTextMatcher(() => nodes, { getText });

		let node = matcher('a');
		expect(node).toBe(nodes[0]);

		// Modify text content so it no longer matches
		nodes[0]!.text = 'Banana';

		// Wait for delay window and add on
		vi.advanceTimersByTime(500);
		node = matcher('p');
		expect(node).toBe(null);
	});

	it('should handle empty text content', () => {
		const nodes = setupNodes('', '');
		const matcher = createTextMatcher(() => nodes, { getText });

		const node = matcher('a');
		expect(node).toBe(null);
	});
});
