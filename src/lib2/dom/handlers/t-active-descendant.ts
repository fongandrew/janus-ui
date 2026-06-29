/**
 * `t-active-descendant` — manage `aria-activedescendant` via arrow keys without
 * moving DOM focus (§12.2.4). Used by listbox / combobox patterns.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { ROVING_ITEM_SELECTOR } from '~/lib2/dom/focusables';

function items(el: HTMLElement): HTMLElement[] {
	return Array.from(el.querySelectorAll<HTMLElement>(ROVING_ITEM_SELECTOR));
}

const ACTIVE_CLASS = 'v-colors-highlight';

function setActive(el: HTMLElement, target: HTMLElement | undefined): void {
	if (!target) return;
	if (!target.id)
		target.id = `janus-ad-${Math.round(performance.now())}-${items(el).indexOf(target)}`;
	el.setAttribute('aria-activedescendant', target.id);
	for (const item of items(el)) {
		item.classList.toggle(ACTIVE_CLASS, item === target);
		item.toggleAttribute('data-active', item === target);
	}
}

registerBehavior('t-active-descendant', {
	keydown(el, ev) {
		const event = ev as KeyboardEvent;
		const list = items(el);
		if (!list.length) return;
		const activeId = el.getAttribute('aria-activedescendant');
		const current = list.findIndex((i) => i.id === activeId);

		let next: HTMLElement | undefined;
		if (event.key === 'ArrowDown') next = list[current + 1] ?? list[0];
		else if (event.key === 'ArrowUp') next = list[current - 1] ?? list[list.length - 1];
		else if (event.key === 'Home') next = list[0];
		else if (event.key === 'End') next = list[list.length - 1];

		if (next) {
			event.preventDefault();
			setActive(el, next);
		}
	},
});

/** Producer: manage active-descendant within this container. */
export function activeDescendant() {
	return { 'data-js': concat('t-active-descendant') };
}
