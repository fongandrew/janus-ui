/**
 * `t-typeahead-filter` — buffer keystrokes and jump to a matching item (§12.2.4).
 *
 * Buffers printable keys within a ~500ms window and focuses the first item whose
 * text starts with the buffer. Used by menus and listboxes.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { ROVING_ITEM_SELECTOR } from '~/lib2/dom/focusables';

const WINDOW_MS = 500;
const buffers = new WeakMap<Element, { text: string; at: number }>();

function items(el: HTMLElement): HTMLElement[] {
	return Array.from(el.querySelectorAll<HTMLElement>(ROVING_ITEM_SELECTOR));
}

registerBehavior('t-typeahead-filter', {
	keydown(el, ev) {
		const event = ev as KeyboardEvent;
		// Only single printable characters; ignore modifiers and control keys.
		if (event.key.length !== 1 || event.metaKey || event.ctrlKey || event.altKey) return;

		const now = Date.now();
		const prev = buffers.get(el);
		const text = (prev && now - prev.at < WINDOW_MS ? prev.text : '') + event.key.toLowerCase();
		buffers.set(el, { text, at: now });

		const match = items(el).find((item) =>
			(item.textContent ?? '').trim().toLowerCase().startsWith(text),
		);
		if (match) {
			event.preventDefault();
			match.focus();
		}
	},
});

/** Producer: enable typeahead letter-jump within this container. */
export function typeaheadFilter() {
	return { 'data-js': concat('t-typeahead-filter') };
}
