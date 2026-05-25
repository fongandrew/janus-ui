import { registerBehavior } from '../dispatch';
import { concat } from '../compose-attrs';

function getFocusableItems(el: Element): HTMLElement[] {
	const items: HTMLElement[] = [];
	for (const child of Array.from(el.children)) {
		if (child instanceof HTMLElement && !child.hasAttribute('disabled') && child.getAttribute('aria-disabled') !== 'true') {
			items.push(child);
		}
	}
	return items;
}

function getAxis(el: Element): 'horizontal' | 'vertical' | 'both' {
	return (el.getAttribute('aria-orientation') as 'horizontal' | 'vertical') ?? 'both';
}

registerBehavior('t-roving-focus', {
	mount(el) {
		const items = getFocusableItems(el);
		const active = items.find((item) => item.getAttribute('tabindex') === '0') ?? items[0];
		for (const item of items) {
			item.setAttribute('tabindex', item === active ? '0' : '-1');
		}
	},

	keydown(el, ev) {
		const event = ev as KeyboardEvent;
		const axis = getAxis(el);
		const items = getFocusableItems(el);
		if (items.length === 0) return;

		const current = items.findIndex((item) => item === document.activeElement);
		if (current === -1) return;

		let next = -1;
		const isHorizontal = axis === 'horizontal' || axis === 'both';
		const isVertical = axis === 'vertical' || axis === 'both';

		if (event.key === 'ArrowRight' && isHorizontal) {
			next = (current + 1) % items.length;
		} else if (event.key === 'ArrowLeft' && isHorizontal) {
			next = (current - 1 + items.length) % items.length;
		} else if (event.key === 'ArrowDown' && isVertical) {
			next = (current + 1) % items.length;
		} else if (event.key === 'ArrowUp' && isVertical) {
			next = (current - 1 + items.length) % items.length;
		} else if (event.key === 'Home') {
			next = 0;
		} else if (event.key === 'End') {
			next = items.length - 1;
		}

		if (next >= 0) {
			event.preventDefault();
			items[current]!.setAttribute('tabindex', '-1');
			items[next]!.setAttribute('tabindex', '0');
			items[next]!.focus();
		}
	},

	focusin(el, ev) {
		const items = getFocusableItems(el);
		const target = ev.target as HTMLElement;
		if (items.includes(target)) {
			for (const item of items) {
				item.setAttribute('tabindex', item === target ? '0' : '-1');
			}
		}
	},
});

export function rovingFocus(opts?: { axis?: 'horizontal' | 'vertical' | 'both' }) {
	return {
		'data-js': concat('t-roving-focus'),
		...(opts?.axis ? { 'aria-orientation': opts.axis } : {}),
	};
}
