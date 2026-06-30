/**
 * The behavior dispatcher (design spec §12.2.2-12.2.3). Exactly one
 * document-level capture-phase listener is installed per event type that
 * some registered behavior declares. On each event the dispatcher walks
 * from the event target upward, reading one `data-js` attribute per
 * ancestor, and invokes the matching handler for every behavior token found.
 */

import { JS_ATTR } from '~/lib2/dom/config';
import { evalWithDocument, registerDocumentSetup } from '~/lib2/dom/document-setup';

export type DomEventName = keyof DocumentEventMap;

export type BehaviorHandler<E extends Event = Event> = (el: Element, ev: E) => void;

export type BehaviorManifest = {
	/** Runs once when the element is discovered (initial scan or MutationObserver). */
	mount?: (el: Element) => void;
} & {
	[K in DomEventName]?: BehaviorHandler<DocumentEventMap[K]>;
};

const registry = new Map<string, BehaviorManifest>();
const installedListeners = new Map<DomEventName, EventListener>();
let mounted = false;

function isEventKey(key: string): key is DomEventName {
	return key !== 'mount';
}

function installListener(eventName: DomEventName): void {
	if (installedListeners.has(eventName)) {
		return;
	}
	const listener: EventListener = (ev) => {
		let el: Element | null = ev.target instanceof Element ? ev.target : null;
		while (el) {
			const tokens = el.getAttribute(JS_ATTR);
			if (tokens) {
				for (const token of tokens.split(/\s+/).filter(Boolean)) {
					const manifest = registry.get(token);
					const handler = manifest?.[eventName] as BehaviorHandler<Event> | undefined;
					handler?.(el, ev);
				}
			}
			el = el.parentElement;
		}
	};
	installedListeners.set(eventName, listener);
	// Installed per-document (not just the bare `document` global) so a
	// child/popup window registered via `registerDocument` gets the same
	// dispatcher wiring.
	registerDocumentSetup((doc) => doc.addEventListener(eventName, listener, { capture: true }));
}

/**
 * Register a behavior's manifest under `name` (matching its filename,
 * `handlers/<name>.ts`). Importing a handler module registers it as a side
 * effect; if nothing ever imports it, tree-shaking removes it.
 */
export function registerBehavior(name: string, manifest: BehaviorManifest): void {
	registry.set(name, manifest);
	for (const key of Object.keys(manifest)) {
		if (isEventKey(key)) {
			installListener(key);
		}
	}
	if (manifest.mount && mounted) {
		evalWithDocument((doc) => {
			for (const el of doc.querySelectorAll(`[${JS_ATTR}~="${name}"]`)) {
				manifest.mount!(el);
			}
		});
	}
}

/** True once `mount()` (in `~/lib2/dom/mount`) has run at least once. Internal. */
export function isMounted(): boolean {
	return mounted;
}

/** Internal: marks the dispatcher as mounted. Called by `mount()`. */
export function markMounted(): void {
	mounted = true;
}

/** Run every registered behavior's `mount` hook against `el`, if it carries a matching token. */
export function dispatchMount(el: Element): void {
	const tokens = el.getAttribute(JS_ATTR);
	if (!tokens) {
		return;
	}
	for (const token of tokens.split(/\s+/).filter(Boolean)) {
		registry.get(token)?.mount?.(el);
	}
}

/** Internal: read the manifest registered for a behavior name, if any. Exposed for handler modules that need to chain into another behavior. */
export function getBehavior(name: string): BehaviorManifest | undefined {
	return registry.get(name);
}

/** Internal: clears the registry and removes installed document listeners. Test-only. */
export function _resetDispatchForTests(): void {
	registry.clear();
	for (const [eventName, listener] of installedListeners) {
		evalWithDocument((doc) => doc.removeEventListener(eventName, listener, { capture: true }));
	}
	installedListeners.clear();
	mounted = false;
}
