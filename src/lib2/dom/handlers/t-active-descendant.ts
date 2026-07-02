/**
 * t-active-descendant (§12.2.4) — manages aria-activedescendant on arrow keys
 * without moving DOM focus (listbox / combobox pattern).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const ITEM_SELECTOR = '[role="option"], [role="menuitem"], [data-roving-item]';

registerBehavior('t-active-descendant', {
	keydown(el, ev) {
		const e = ev as KeyboardEvent;
		if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
		const items = [...el.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
		if (!items.length) return;
		e.preventDefault();
		const currentId = el.getAttribute('aria-activedescendant');
		let index = items.findIndex((it) => it.id === currentId);
		index = (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
		const target = items[index]!;
		if (!target.id) target.id = `js-ad-${index}-${Math.round(performance.now())}`;
		el.setAttribute('aria-activedescendant', target.id);
		items.forEach((it) => it.removeAttribute('data-active'));
		target.setAttribute('data-active', '');
	},
});

export function activeDescendant() {
	return { 'data-js': concat('t-active-descendant') };
}
