/**
 * t-typeahead-filter (§12.2.4) — buffers keystrokes (~500ms) and focuses the
 * first item whose text starts with the buffer.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const ITEM_SELECTOR =
	'[role="menuitem"], [role="option"], [role="menuitemradio"], [role="menuitemcheckbox"], [data-roving-item]';

const buffers = new WeakMap<Element, { text: string; timer: number }>();

registerBehavior('t-typeahead-filter', {
	keydown(el, ev) {
		const e = ev as KeyboardEvent;
		if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
		const state = buffers.get(el) ?? { text: '', timer: 0 };
		clearTimeout(state.timer);
		state.text += e.key.toLowerCase();
		state.timer = setTimeout(() => buffers.delete(el), 500) as unknown as number;
		buffers.set(el, state);

		const items = [...el.querySelectorAll<HTMLElement>(ITEM_SELECTOR)];
		const match = items.find((it) => (it.textContent ?? '').trim().toLowerCase().startsWith(state.text));
		if (match) {
			items.forEach((it) => (it.tabIndex = it === match ? 0 : -1));
			match.focus();
		}
	},
});

export function typeaheadFilter() {
	return { 'data-js': concat('t-typeahead-filter') };
}
