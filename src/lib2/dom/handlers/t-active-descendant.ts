/**
 * `t-active-descendant` — manages `aria-activedescendant` based on arrow
 * keys without moving DOM focus. Used by listbox / combobox patterns.
 */

import { type AttrValue, concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

type ActiveListener = (item: HTMLElement | null) => void;

const listeners = new WeakMap<Element, Set<ActiveListener>>();

/** Subscribe to active-descendant changes. Returns a cleanup. */
export function addActiveDescendantListener(el: Element, fn: ActiveListener): () => void {
	let set = listeners.get(el);
	if (!set) {
		set = new Set();
		listeners.set(el, set);
	}
	set.add(fn);
	return () => {
		listeners.get(el)?.delete(fn);
	};
}

function items(el: Element): HTMLElement[] {
	return Array.from(el.querySelectorAll<HTMLElement>(':scope > [id]'));
}

function setActive(el: Element, item: HTMLElement | null): void {
	if (item) {
		el.setAttribute('aria-activedescendant', item.id);
	} else {
		el.removeAttribute('aria-activedescendant');
	}
	for (const candidate of items(el)) {
		candidate.toggleAttribute('data-active', candidate === item);
	}
	for (const fn of listeners.get(el) ?? []) {
		fn(item);
	}
}

registerBehavior('t-active-descendant', {
	mount(el) {
		const list = items(el);
		if (list.length > 0 && !el.hasAttribute('aria-activedescendant')) {
			setActive(el, list[0]!);
		}
	},
	keydown(el, ev) {
		const list = items(el);
		if (list.length === 0) {
			return;
		}
		const currentId = el.getAttribute('aria-activedescendant');
		const current = Math.max(
			0,
			list.findIndex((item) => item.id === currentId),
		);

		let next: number;
		if (ev.key === 'ArrowDown') {
			next = Math.min(list.length - 1, current + 1);
		} else if (ev.key === 'ArrowUp') {
			next = Math.max(0, current - 1);
		} else if (ev.key === 'Home') {
			next = 0;
		} else if (ev.key === 'End') {
			next = list.length - 1;
		} else {
			return;
		}

		ev.preventDefault();
		setActive(el, list[next]!);
	},
});

/** Producer: opts a container into `t-active-descendant`. */
export function activeDescendant(): Record<string, AttrValue> {
	return { 'data-js': concat('t-active-descendant') };
}
