/**
 * `mount()` — the entry point that primes the dispatcher (§12.2.3). Walks
 * the DOM once, fires the synthetic `mount` event on every element whose
 * `data-js` tokens include a behavior with a `mount` hook, then installs a
 * `MutationObserver` so nodes added later get the same treatment.
 */

import { JS_ATTR } from '~/lib2/dom/config';
import { dispatchMount, markMounted } from '~/lib2/dom/dispatch';
import { registerDocument } from '~/lib2/dom/document-setup';
import { parentDocument } from '~/lib2/dom/multi-view';

let observer: MutationObserver | undefined;

function scan(root: ParentNode): void {
	if (root instanceof Element && root.hasAttribute(JS_ATTR)) {
		dispatchMount(root);
	}
	for (const el of root.querySelectorAll(`[${JS_ATTR}]`)) {
		dispatchMount(el);
	}
}

function handleMutations(mutations: MutationRecord[]): void {
	for (const mutation of mutations) {
		for (const node of mutation.addedNodes) {
			if (node instanceof Element) {
				scan(node);
			}
		}
	}
}

/**
 * Walk the DOM, fire `mount` for every element opted into a behavior with a
 * mount hook, and install the `MutationObserver` for nodes added later.
 * Idempotent — calling it more than once is a no-op after the first call.
 * Pass a child/popup window's `document` to extend mounting (and the
 * dispatcher's listeners) to that window too.
 */
export function mount(root: ParentNode | undefined = parentDocument): void {
	if (!root) {
		return;
	}
	if (root instanceof Document) {
		registerDocument(root);
	}
	scan(root);
	markMounted();
	if (!observer && typeof MutationObserver !== 'undefined') {
		observer = new MutationObserver(handleMutations);
		const observeRoot = root instanceof Document ? root.documentElement : root;
		observer.observe(observeRoot, { childList: true, subtree: true });
	}
}

/** Stop observing for new nodes. Test-only / teardown helper. */
export function unmount(): void {
	observer?.disconnect();
	observer = undefined;
}
