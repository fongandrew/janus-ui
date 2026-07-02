/**
 * mount() — the entry point that primes the system (§12.2.3): installs the
 * document-level listeners, walks the DOM once firing synthetic `mount` for
 * every element whose data-js tokens include a behavior with a mount hook,
 * and installs a MutationObserver so newly-added nodes mount too.
 */
import { jsAttr } from '~/lib2/dom/config';
import { activateDispatch, fireMount } from '~/lib2/dom/dispatch';

let observer: MutationObserver | null = null;

function scanTree(root: Element): void {
	const attr = jsAttr();
	if (root.hasAttribute(attr)) fireMount(root);
	for (const el of root.querySelectorAll(`[${attr}]`)) {
		fireMount(el);
	}
}

export function mount(root: Element | Document = document): void {
	activateDispatch();

	const scanRoot = root instanceof Document ? root.documentElement : root;
	scanTree(scanRoot);

	if (observer) return;
	observer = new MutationObserver((records) => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (node instanceof Element) scanTree(node);
			}
		}
	});
	observer.observe(scanRoot.ownerDocument?.body ?? scanRoot, {
		childList: true,
		subtree: true,
	});
}

/** Stop the MutationObserver (tests / teardown). */
export function unmountObserver(): void {
	observer?.disconnect();
	observer = null;
}
