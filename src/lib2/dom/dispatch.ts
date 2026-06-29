/**
 * The behavior dispatcher (§12.2.2–12.2.3).
 *
 * Each behavior registers a manifest of lifecycle hooks. The library installs
 * exactly one document-level capture-phase listener per event type that some
 * registered behavior declares. On each event the dispatcher walks the composed
 * path from target upward, reads one `data-js` attribute per ancestor, and invokes
 * the matching behavior handler for the current event type.
 */
import { jsAttr } from '~/lib2/dom/config';

/** A handler invoked for a real DOM event the behavior declares. */
export type EventHook = (el: HTMLElement, ev: Event) => void;

/** A handler invoked once when a matching element is mounted. */
export type MountHook = (el: HTMLElement) => void;

/**
 * A behavior manifest. `mount` runs at setup; every other key is an event type
 * (`click`, `keydown`, `change`, …) whose handler the dispatcher routes events to.
 */
export interface BehaviorManifest {
	/** Runs once when a matching element mounts (a one-arg special case). */
	mount?: MountHook;
	/**
	 * Event handlers keyed by event type (`click`, `keydown`, …). Typed as the
	 * two-arg {@link EventHook}; `mount` (a one-arg `MountHook`) is assignable here
	 * because a function accepting fewer parameters is assignable to one accepting
	 * more, so authors still get precise `(el, ev)` inference on event handlers.
	 */
	[eventType: string]: EventHook | undefined;
}

const behaviors = new Map<string, BehaviorManifest>();
const installedEvents = new Set<string>();

function dispatch(ev: Event): void {
	const attrName = jsAttr();
	for (const node of ev.composedPath()) {
		if (!(node instanceof Element)) continue;
		const attr = node.getAttribute(attrName);
		if (!attr) continue;
		for (const token of attr.split(/\s+/)) {
			if (!token) continue;
			const handler = behaviors.get(token)?.[ev.type];
			if (typeof handler === 'function') {
				(handler as EventHook)(node as HTMLElement, ev);
			}
		}
	}
}

function installListener(eventType: string): void {
	if (installedEvents.has(eventType)) return;
	installedEvents.add(eventType);
	if (typeof document === 'undefined') return;
	document.addEventListener(eventType, dispatch, { capture: true });
}

/**
 * Register a behavior manifest under `name` (its filename). Importing the module
 * is the side effect that mounts it into the dispatcher. Installs a document-level
 * listener for each declared event type on first registration.
 */
export function registerBehavior(name: string, manifest: BehaviorManifest): void {
	behaviors.set(name, manifest);
	for (const key of Object.keys(manifest)) {
		if (key === 'mount') continue;
		installListener(key);
	}
}

/** Look up a registered behavior manifest by name. */
export function getBehavior(name: string): BehaviorManifest | undefined {
	return behaviors.get(name);
}

/** True if any registered behavior named on `el`'s `data-js` declares a `mount` hook. */
export function hasMountHook(el: Element): boolean {
	const attr = el.getAttribute(jsAttr());
	if (!attr) return false;
	for (const token of attr.split(/\s+/)) {
		if (behaviors.get(token)?.mount) return true;
	}
	return false;
}

/** Run every `mount` hook declared by `el`'s `data-js` tokens, in source order. */
export function dispatchMount(el: HTMLElement): void {
	const attr = el.getAttribute(jsAttr());
	if (!attr) return;
	for (const token of attr.split(/\s+/)) {
		if (!token) continue;
		behaviors.get(token)?.mount?.(el);
	}
}
