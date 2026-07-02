/**
 * t-typeahead-filter — buffers printable keystrokes (~500ms window) and
 * focuses the first matching item (§12.2.4).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { navigableItems } from '~/lib2/dom/focusables';

const WINDOW_MS = 500;

interface Buffer {
	text: string;
	at: number;
}

const buffers = new WeakMap<Element, Buffer>();

registerBehavior('t-typeahead-filter', {
	keydown(el, ev: KeyboardEvent) {
		if (ev.key.length !== 1 || ev.ctrlKey || ev.metaKey || ev.altKey) return;
		// Don't hijack typing in text fields
		if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement)
			return;

		const now = performance.now();
		const buffer = buffers.get(el);
		const text =
			buffer && now - buffer.at < WINDOW_MS
				? buffer.text + ev.key.toLowerCase()
				: ev.key.toLowerCase();
		buffers.set(el, { text, at: now });

		const match = navigableItems(el).find((item) =>
			(item.textContent ?? '').trim().toLowerCase().startsWith(text),
		);
		if (match) {
			ev.preventDefault();
			match.focus();
		}
	},
});

export function typeaheadFilter() {
	return { 'data-js': concat('t-typeahead-filter') };
}
