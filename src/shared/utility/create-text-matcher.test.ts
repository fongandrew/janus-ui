import { createTextMatcher } from '~/shared/utility/create-text-matcher';

describe('createTextMatcher', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		document.body.replaceChildren();
		vi.useRealTimers();
	});

	const setupDivs = (...text: string[]) => {
		const divs = text.map((t) => {
			const div = document.createElement('div');
			div.textContent = t;
			return div;
		});
		document.body.append(...divs);
		return divs;
	};

	it('should match text content in nodes', () => {
		const divs = setupDivs('Apple', 'Banana', 'Orange');
		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		const node = matcher('Ban');
		expect(node).toBe(divs[1]);
	});

	it('should accumulate characters within delay window', () => {
		const divs = setupDivs('Apple', 'Apricot', 'Avocado');
		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		// Type 'Apr' within delay window
		let node = matcher('A');
		expect(node).toBe(divs[0]);
		node = matcher('p');
		expect(node).toBe(divs[0]);
		node = matcher('r');
		expect(node).toBe(divs[1]);
	});

	it('should match on any substring', () => {
		const divs = setupDivs('Apple', 'Apricot', 'Avocado');
		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		const node = matcher('cot');
		expect(node).toBe(divs[1]);
	});

	it('should prefer matches that start with string over substring', () => {
		const divs = setupDivs('Apricot', 'Avocado', 'Cotton Candy');
		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		const node = matcher('cot');
		expect(node).toBe(divs[2]);
	});

	it('should reset text after delay window', () => {
		const divs = setupDivs('Apple', 'Apricot', 'Avocado');
		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		// Type 'A' within delay window
		let node = matcher('A');
		expect(node).toBe(divs[0]);

		// Wait for delay window and type 'Av'
		vi.advanceTimersByTime(500);
		node = matcher('A');
		expect(node).toBe(divs[0]);
		node = matcher('v');
		expect(node).toBe(divs[2]);
	});

	it('should compare normalized text', () => {
		const divs = setupDivs('Apple', 'Apricot', 'Avocado');
		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		const node = matcher('  apr');
		expect(node).toBe(divs[1]);
	});

	it('should cache normalized text during delay window', () => {
		const divs = setupDivs('Apple', 'Avocado');
		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		let node = matcher('a');
		expect(node).toBe(divs[0]);

		// Modify text content so it no longer matches
		divs[0]!.textContent = 'Banana';

		// Still matches because cached
		node = matcher('p');
		expect(node).toBe(divs[0]);
	});

	it('should clear cache after delay window', () => {
		const divs = setupDivs('Apple', 'Avocado');
		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		let node = matcher('a');
		expect(node).toBe(divs[0]);

		// Modify text content so it no longer matches
		divs[0]!.textContent = 'Banana';

		// Wait for delay window and add on
		vi.advanceTimersByTime(500);
		node = matcher('p');
		expect(node).toBe(null);
	});

	it('should handle empty or null text content', () => {
		const div1 = document.createElement('div');
		div1.textContent = '';
		const div2 = document.createElement('div');
		div2.textContent = null;
		document.body.append(div1, div2);

		const matcher = createTextMatcher(() => document.querySelectorAll('div'));

		const node = matcher('a');
		expect(node).toBe(null);
	});
});
