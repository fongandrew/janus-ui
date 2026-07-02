/**
 * t-active-descendant — manages aria-activedescendant + data-active on items
 * from arrow keys without moving DOM focus (§12.2.4). Used by listbox /
 * combobox patterns; the CSS highlight keys off [data-active] in keyboard
 * mode (aesthetic spec §09).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { navigableItems } from '~/lib2/dom/focusables';

let idCounter = 0;

function ensureId(el: Element): string {
	if (!el.id) el.id = `janus-ad-${++idCounter}`;
	return el.id;
}

function setActive(container: Element, items: HTMLElement[], index: number): void {
	items.forEach((item, i) => {
		if (i === index) {
			item.setAttribute('data-active', '');
			container.setAttribute('aria-activedescendant', ensureId(item));
			item.scrollIntoView({ block: 'nearest' });
		} else {
			item.removeAttribute('data-active');
		}
	});
}

registerBehavior('t-active-descendant', {
	mount(el) {
		for (const item of navigableItems(el)) ensureId(item);
	},

	keydown(el, ev: KeyboardEvent) {
		const items = navigableItems(el);
		if (!items.length) return;
		const current = items.findIndex((item) => item.hasAttribute('data-active'));

		let next: number | null = null;
		if (ev.key === 'ArrowDown') next = current < 0 ? 0 : (current + 1) % items.length;
		else if (ev.key === 'ArrowUp')
			next = current < 0 ? items.length - 1 : (current - 1 + items.length) % items.length;
		else if (ev.key === 'Home') next = 0;
		else if (ev.key === 'End') next = items.length - 1;

		if (next === null) return;
		ev.preventDefault();
		setActive(el, items, next);
	},
});

export function activeDescendant() {
	return { 'data-js': concat('t-active-descendant') };
}
