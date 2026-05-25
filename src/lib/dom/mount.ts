import { getAttr } from './config';
import { fireMountForElement } from './dispatch';

let mounted = false;
let observer: MutationObserver | null = null;

function walkAndMount(root: Element | Document): void {
	const attr = getAttr();
	const elements = (root instanceof Document ? root.documentElement : root).querySelectorAll(
		`[${attr}]`,
	);
	for (const el of elements) {
		fireMountForElement(el);
	}
	if (root instanceof Element && root.hasAttribute(attr)) {
		fireMountForElement(root);
	}
}

export function mount(root: Document | Element = document): void {
	if (mounted) return;
	mounted = true;

	walkAndMount(root);

	observer = new MutationObserver((mutations) => {
		const attr = getAttr();
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (node instanceof Element) {
					if (node.hasAttribute(attr)) {
						fireMountForElement(node);
					}
					const children = node.querySelectorAll(`[${attr}]`);
					for (const child of children) {
						fireMountForElement(child);
					}
				}
			}
		}
	});

	const target = root instanceof Document ? root.documentElement : root;
	observer.observe(target, { childList: true, subtree: true });
}

export function unmount(): void {
	if (observer) {
		observer.disconnect();
		observer = null;
	}
	mounted = false;
}
