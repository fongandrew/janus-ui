/**
 * Dispatch model (§12.2.3). Exactly one document-level capture-phase listener
 * per event type that some registered behavior declares. On each event the
 * dispatcher walks from the target upward, reading one `data-js` attribute per
 * ancestor and invoking the matching behavior handlers.
 */
import { jsAttr } from '~/lib2/dom/config';

export type BehaviorEventHandler = (el: Element, ev: Event) => void;
export type BehaviorMountHandler = (el: Element) => void;

export interface BehaviorManifest {
	/** Setup before the first user event (tabindex demotion, wiring, etc.). */
	mount?: BehaviorMountHandler;
	/** Event handlers keyed by DOM event type. A single function type here (not
	    a union) lets `click(el, ev) {}` contextually type its parameters. */
	[eventType: string]: BehaviorEventHandler | undefined;
}

const behaviors = new Map<string, BehaviorManifest>();
const installedEvents = new Set<string>();
let dispatchInstalled = false;

export function registerBehavior(name: string, manifest: BehaviorManifest): void {
	behaviors.set(name, manifest);
	if (dispatchInstalled) installFor(manifest);
}

export function getBehavior(name: string): BehaviorManifest | undefined {
	return behaviors.get(name);
}

function ensureListener(type: string): void {
	if (type === 'mount' || installedEvents.has(type)) return;
	installedEvents.add(type);
	document.addEventListener(type, dispatch, true);
}

function installFor(manifest: BehaviorManifest): void {
	for (const type of Object.keys(manifest)) ensureListener(type);
}

function tokens(el: Element, attr: string): string[] {
	const raw = el.getAttribute(attr);
	return raw ? raw.split(/\s+/).filter(Boolean) : [];
}

function dispatch(ev: Event): void {
	const attr = jsAttr();
	let node: Element | null = ev.target instanceof Element ? ev.target : null;
	while (node) {
		if (node.hasAttribute(attr)) {
			for (const token of tokens(node, attr)) {
				const fn = behaviors.get(token)?.[ev.type] as BehaviorEventHandler | undefined;
				if (fn) fn(node, ev);
			}
		}
		node = node.parentElement;
	}
}

/** Install document-level listeners for every event type registered so far. */
export function installDispatch(): void {
	dispatchInstalled = true;
	for (const manifest of behaviors.values()) installFor(manifest);
}

/** Fire the synthetic `mount` hook for an element's behaviors. */
export function runMount(el: Element): void {
	const attr = jsAttr();
	if (!el.hasAttribute(attr)) return;
	for (const token of tokens(el, attr)) {
		behaviors.get(token)?.mount?.(el);
	}
}

/** Test-only: clear all registered behaviors and listeners. */
export function _resetDispatch(): void {
	for (const type of installedEvents) document.removeEventListener(type, dispatch, true);
	behaviors.clear();
	installedEvents.clear();
	dispatchInstalled = false;
}
