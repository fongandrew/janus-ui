import '~/lib2/dom/handlers/t-roving-focus';

import { afterEach, describe, expect, it } from 'vitest';

import { mount, unmount } from '~/lib2/dom/mount';

afterEach(() => {
	unmount();
	document.body.innerHTML = '';
});

function setup(): { group: HTMLElement; buttons: HTMLButtonElement[] } {
	const group = document.createElement('div');
	group.setAttribute('data-js', 't-roving-focus');
	group.setAttribute('role', 'toolbar');
	group.setAttribute('aria-orientation', 'horizontal');
	group.innerHTML = '<button>A</button><button>B</button><button>C</button>';
	document.body.append(group);
	mount();
	return { group, buttons: Array.from(group.querySelectorAll('button')) };
}

describe('t-roving-focus', () => {
	it('demotes non-active items to tabindex -1 on mount', () => {
		const { buttons } = setup();
		expect(buttons[0]!.tabIndex).toBe(0);
		expect(buttons[1]!.tabIndex).toBe(-1);
		expect(buttons[2]!.tabIndex).toBe(-1);
	});

	it('moves focus with ArrowRight and wraps', () => {
		const { group, buttons } = setup();
		buttons[0]!.focus();
		group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		expect(document.activeElement).toBe(buttons[1]);
		expect(buttons[1]!.tabIndex).toBe(0);

		buttons[2]!.focus();
		group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		expect(document.activeElement).toBe(buttons[0]);
	});

	it('End jumps to the last item, Home to the first', () => {
		const { group, buttons } = setup();
		buttons[0]!.focus();
		group.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		expect(document.activeElement).toBe(buttons[2]);
		group.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
		expect(document.activeElement).toBe(buttons[0]);
	});
});
