/**
 * `t-typeahead-filter` — buffers keystrokes (~500ms window) and focuses the
 * first direct-child item whose text starts with the buffer. Markup usage
 * gets the built-in text matcher; `addTypeaheadMatcher(el, fn)` is the
 * imperative escape hatch for a custom match function (mirrors `addValidator`'s
 * WeakMap pattern, since a closure can't be serialized into `data-js`).
 */

import { type AttrValue, concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

const TYPEAHEAD_WINDOW_MS = 500;

type Matcher = (buffer: string) => HTMLElement | null;

const customMatchers = new WeakMap<Element, Matcher>();

/** Attach a custom match function. Returns a cleanup that detaches it. */
export function addTypeaheadMatcher(el: Element, fn: Matcher): () => void {
	customMatchers.set(el, fn);
	return () => {
		if (customMatchers.get(el) === fn) {
			customMatchers.delete(el);
		}
	};
}

function defaultMatch(el: Element, buffer: string): HTMLElement | null {
	const lower = buffer.toLowerCase();
	const candidates = Array.from(el.querySelectorAll<HTMLElement>(':scope > *'));
	return (
		candidates.find((item) =>
			(item.textContent ?? '').trim().toLowerCase().startsWith(lower),
		) ?? null
	);
}

const buffers = new WeakMap<Element, { text: string; timer: ReturnType<typeof setTimeout> }>();

registerBehavior('t-typeahead-filter', {
	keydown(el, ev) {
		if (ev.key.length !== 1 || ev.altKey || ev.ctrlKey || ev.metaKey) {
			return;
		}
		const state = buffers.get(el);
		if (state) {
			clearTimeout(state.timer);
		}
		const text = (state?.text ?? '') + ev.key;
		const timer = setTimeout(() => buffers.delete(el), TYPEAHEAD_WINDOW_MS);
		buffers.set(el, { text, timer });

		const matcher = customMatchers.get(el) ?? ((buffer: string) => defaultMatch(el, buffer));
		const match = matcher(text);
		if (match) {
			ev.preventDefault();
			match.focus();
		}
	},
});

/** Producer: opts a container into `t-typeahead-filter`. */
export function typeaheadFilter(): Record<string, AttrValue> {
	return { 'data-js': concat('t-typeahead-filter') };
}
