/**
 * `mount()` (§12.2.3) — primes the system at startup: installs the document
 * listeners, fires the synthetic `mount` event across the initial DOM, wires a
 * MutationObserver for later-added nodes, and initializes the form engine.
 */
import { jsAttr } from '~/lib2/dom/config';
import { installDispatch, runMount } from '~/lib2/dom/dispatch';
import { initFormEngine } from '~/lib2/dom/form';

let observer: MutationObserver | null = null;

function scan(root: ParentNode): void {
	const attr = jsAttr();
	if (root instanceof Element) runMount(root);
	root.querySelectorAll?.(`[${attr}]`).forEach((el) => runMount(el));
}

export function mount(root: ParentNode = document): void {
	installDispatch();
	initFormEngine();
	scan(root);

	if (!observer && typeof MutationObserver !== 'undefined') {
		observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				m.addedNodes.forEach((node) => {
					if (node instanceof Element) scan(node);
				});
			}
		});
		observer.observe(document.documentElement, { childList: true, subtree: true });
	}
}

/** Test-only: disconnect the observer. */
export function _resetMount(): void {
	observer?.disconnect();
	observer = null;
}
