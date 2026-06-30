import '~/lib2/dom/handlers/t-roving-focus';

import { afterEach, describe, expect, it } from 'vitest';

import { mount, unmount } from '~/lib2/dom/mount';

// NOTE: this file imports the real handler module once at the top, so its
// `registerBehavior('t-roving-focus', ...)` call runs exactly once (ES
// modules are cached). Don't call `_resetDispatchForTests()` here -- it
// would clear that one-time registration with no way to get it back.
afterEach(() => {
	unmount();
	document.body.innerHTML = '';
});

function arrowKey(el: Element, key: string): void {
	el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

describe('t-roving-focus', () => {
	it('demotes every item but the first to tabindex -1 on mount', () => {
		document.body.innerHTML = `
			<div role="toolbar" data-js="t-roving-focus" aria-orientation="horizontal" data-roving-axis="horizontal">
				<button id="a">A</button>
				<button id="b">B</button>
				<button id="c">C</button>
			</div>
		`;
		mount();

		expect(document.getElementById('a')!.tabIndex).toBe(0);
		expect(document.getElementById('b')!.tabIndex).toBe(-1);
		expect(document.getElementById('c')!.tabIndex).toBe(-1);
	});

	it('moves focus and tabindex with ArrowRight on a horizontal group', () => {
		document.body.innerHTML = `
			<div role="toolbar" data-js="t-roving-focus" data-roving-axis="horizontal">
				<button id="a">A</button>
				<button id="b">B</button>
			</div>
		`;
		mount();
		document.getElementById('a')!.focus();

		arrowKey(document.getElementById('a')!, 'ArrowRight');

		expect(document.activeElement?.id).toBe('b');
		expect(document.getElementById('a')!.tabIndex).toBe(-1);
		expect(document.getElementById('b')!.tabIndex).toBe(0);
	});

	it('does not move past the last item without wrap', () => {
		document.body.innerHTML = `
			<div role="toolbar" data-js="t-roving-focus" data-roving-axis="horizontal">
				<button id="a">A</button>
				<button id="b">B</button>
			</div>
		`;
		mount();
		document.getElementById('b')!.focus();

		arrowKey(document.getElementById('b')!, 'ArrowRight');

		expect(document.activeElement?.id).toBe('b');
	});

	it('wraps to the first item when data-roving-wrap is set', () => {
		document.body.innerHTML = `
			<div role="toolbar" data-js="t-roving-focus" data-roving-axis="horizontal" data-roving-wrap="true">
				<button id="a">A</button>
				<button id="b">B</button>
			</div>
		`;
		mount();
		document.getElementById('b')!.focus();

		arrowKey(document.getElementById('b')!, 'ArrowRight');

		expect(document.activeElement?.id).toBe('a');
	});

	it('jumps to the last item on End when data-roving-home-end is set', () => {
		document.body.innerHTML = `
			<div role="toolbar" data-js="t-roving-focus" data-roving-axis="horizontal" data-roving-home-end="true">
				<button id="a">A</button>
				<button id="b">B</button>
				<button id="c">C</button>
			</div>
		`;
		mount();
		document.getElementById('a')!.focus();

		arrowKey(document.getElementById('a')!, 'End');

		expect(document.activeElement?.id).toBe('c');
	});

	it('ignores ArrowDown on a horizontal-only group', () => {
		document.body.innerHTML = `
			<div role="toolbar" data-js="t-roving-focus" data-roving-axis="horizontal">
				<button id="a">A</button>
				<button id="b">B</button>
			</div>
		`;
		mount();
		document.getElementById('a')!.focus();

		arrowKey(document.getElementById('a')!, 'ArrowDown');

		expect(document.activeElement?.id).toBe('a');
	});
});
