import { registerBehavior } from '../dispatch';
import { concat } from '../compose-attrs';

function getItems(el: Element): HTMLElement[] {
	return Array.from(el.querySelectorAll('[role="option"]'));
}

function getActiveIndex(el: Element, items: HTMLElement[]): number {
	const activeId = el.getAttribute('aria-activedescendant');
	if (!activeId) return -1;
	return items.findIndex((item) => item.id === activeId);
}

function setActive(el: Element, item: HTMLElement | undefined): void {
	if (item) {
		el.setAttribute('aria-activedescendant', item.id);
		item.setAttribute('data-active', '');
		for (const sibling of getItems(el)) {
			if (sibling !== item) sibling.removeAttribute('data-active');
		}
	} else {
		el.removeAttribute('aria-activedescendant');
	}
}

registerBehavior('t-active-descendant', {
	keydown(el, ev) {
		const event = ev as KeyboardEvent;
		const items = getItems(el);
		if (items.length === 0) return;

		const current = getActiveIndex(el, items);

		let next = -1;
		if (event.key === 'ArrowDown') {
			next = current < items.length - 1 ? current + 1 : 0;
		} else if (event.key === 'ArrowUp') {
			next = current > 0 ? current - 1 : items.length - 1;
		} else if (event.key === 'Home') {
			next = 0;
		} else if (event.key === 'End') {
			next = items.length - 1;
		}

		if (next >= 0) {
			event.preventDefault();
			setActive(el, items[next]);
		}
	},
});

export function activeDescendant() {
	return { 'data-js': concat('t-active-descendant') };
}
