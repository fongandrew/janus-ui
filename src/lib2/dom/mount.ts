/**
 * `mount()` — primes the dispatcher (§12.2.3).
 *
 * Walks the DOM once, fires the synthetic `mount` hook on every element whose
 * `data-js` tokens include a behavior with a `mount` hook, and installs a
 * `MutationObserver` that does the same for nodes added later. After mount, the
 * document-level listeners installed by `registerBehavior` handle the rest.
 */
import { jsAttr } from '~/lib2/dom/config';
import { dispatchMount, hasMountHook } from '~/lib2/dom/dispatch';

const PROCESSED = new WeakSet<Element>();
let observer: MutationObserver | undefined;

function processElement(el: Element): void {
	if (PROCESSED.has(el)) return;
	if (!hasMountHook(el)) return;
	PROCESSED.add(el);
	dispatchMount(el as HTMLElement);
}

function processTree(root: ParentNode): void {
	const attrName = jsAttr();
	if (root instanceof Element && root.hasAttribute(attrName)) {
		processElement(root);
	}
	for (const el of root.querySelectorAll(`[${attrName}]`)) {
		processElement(el);
	}
}

/**
 * Scan the document for mountable elements and install the `MutationObserver`.
 * Idempotent: a second call re-scans (picking up nodes added outside the observer)
 * but does not double-install the observer.
 */
export function mount(
	root: Document | ParentNode = typeof document !== 'undefined' ? document : (undefined as never),
): void {
	if (!root) return;
	processTree(root instanceof Document ? root : root);

	if (observer || typeof MutationObserver === 'undefined') return;
	const target = root instanceof Document ? root.documentElement : root;
	if (!target) return;

	observer = new MutationObserver((records) => {
		for (const record of records) {
			for (const node of record.addedNodes) {
				if (node instanceof Element) processTree(node);
			}
		}
	});
	observer.observe(target, { childList: true, subtree: true });
}

/** Disconnect the observer (testing / teardown). */
export function unmount(): void {
	observer?.disconnect();
	observer = undefined;
}
