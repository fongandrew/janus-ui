import { getAttr } from './config';

export interface BehaviorManifest {
	mount?: (el: Element) => void;
	[event: string]: ((el: Element, ev: Event) => void) | undefined;
}

const registry = new Map<string, BehaviorManifest>();
const installedListeners = new Set<string>();

export function registerBehavior(name: string, manifest: BehaviorManifest): void {
	registry.set(name, manifest);
	for (const key of Object.keys(manifest)) {
		if (key === 'mount') continue;
		if (!installedListeners.has(key)) {
			installedListeners.add(key);
			document.addEventListener(
				key,
				(ev) => dispatch(key, ev),
				true,
			);
		}
	}
}

export function getBehavior(name: string): BehaviorManifest | undefined {
	return registry.get(name);
}

function dispatch(eventType: string, ev: Event): void {
	const attr = getAttr();
	let el = ev.target as Element | null;
	while (el) {
		const tokens = el.getAttribute(attr);
		if (tokens) {
			for (const token of tokens.split(/\s+/)) {
				const manifest = registry.get(token);
				if (manifest && manifest[eventType]) {
					manifest[eventType]!(el, ev);
				}
			}
		}
		el = el.parentElement;
	}
}

export function fireMountForElement(el: Element): void {
	const attr = getAttr();
	const tokens = el.getAttribute(attr);
	if (!tokens) return;
	for (const token of tokens.split(/\s+/)) {
		const manifest = registry.get(token);
		if (manifest?.mount) {
			manifest.mount(el);
		}
	}
}
