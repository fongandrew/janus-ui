/**
 * Behavior registry + the document-level dispatcher (§12.2.2–12.2.3).
 *
 * Exactly one document-level capture-phase listener per event type that some
 * registered behavior declares. On each event the dispatcher walks from the
 * target upward, reads ONE attribute per ancestor (the configured data-js),
 * splits it on whitespace, and invokes each token's manifest handler for the
 * event type. Cost scales with the tokens on the path, never with the number
 * of behaviors registered globally.
 *
 * SSR-safe: registerBehavior only records the manifest; actual listener
 * installation is deferred until mount() runs in a browser (and happens
 * immediately for behaviors registered after mount).
 */
import { jsAttr } from '~/lib2/dom/config';

export type BehaviorEventHandler = (el: Element, ev: Event) => void;

export interface BehaviorManifest {
	/** Synthetic lifecycle hook — fired by mount() and the MutationObserver. */
	mount?: (el: Element) => void;
	/** DOM event handlers, keyed by event type. */
	[eventType: string]: ((el: Element, ev: never) => void) | undefined;
}

const behaviors = new Map<string, BehaviorManifest>();
const installedEvents = new Set<string>();
const mountHooks: (() => void)[] = [];
let listenersActive = false;

function hasDocument(): boolean {
	return typeof document !== 'undefined';
}

function installListener(eventType: string): void {
	if (installedEvents.has(eventType) || !hasDocument()) return;
	installedEvents.add(eventType);
	document.addEventListener(eventType, dispatchEvent, true);
}

function dispatchEvent(ev: Event): void {
	const attr = jsAttr();
	let node: Element | null =
		ev.target instanceof Element
			? ev.target
			: ((ev.target as Node | null)?.parentElement ?? null);
	while (node) {
		const value = node.getAttribute(attr);
		if (value) {
			for (const token of value.split(/\s+/)) {
				if (!token) continue;
				const handler = behaviors.get(token)?.[ev.type] as BehaviorEventHandler | undefined;
				if (handler) handler(node, ev);
			}
		}
		node = node.parentElement;
	}
}

/**
 * Register a behavior manifest. Importing a handler module is a side effect
 * that mounts the behavior into the dispatcher; if never imported,
 * tree-shaking removes it.
 */
export function registerBehavior(name: string, manifest: BehaviorManifest): void {
	behaviors.set(name, manifest);
	for (const key of Object.keys(manifest)) {
		if (key === 'mount') continue;
		if (listenersActive) installListener(key);
	}
}

/** Look up a registered manifest (used by mount's scan). */
export function getBehavior(name: string): BehaviorManifest | undefined {
	return behaviors.get(name);
}

/**
 * Register a callback to run once when mount() primes the system — for
 * page-level behaviors (t-kb-nav) that need document listeners without any
 * element opting in. SSR-safe: nothing runs until mount().
 */
export function onMount(fn: () => void): void {
	if (listenersActive) fn();
	else mountHooks.push(fn);
}

/**
 * Activate the dispatcher: install document-level listeners for every event
 * type declared by registered behaviors and flush page-level mount hooks.
 * Called by mount(); idempotent.
 */
export function activateDispatch(): void {
	if (!hasDocument()) return;
	listenersActive = true;
	for (const manifest of behaviors.values()) {
		for (const key of Object.keys(manifest)) {
			if (key !== 'mount') installListener(key);
		}
	}
	for (const hook of mountHooks.splice(0)) hook();
}

/** Fire a behavior's mount hooks for one element (its data-js tokens). */
export function fireMount(el: Element): void {
	const value = el.getAttribute(jsAttr());
	if (!value) return;
	for (const token of value.split(/\s+/)) {
		behaviors.get(token)?.mount?.(el);
	}
}
