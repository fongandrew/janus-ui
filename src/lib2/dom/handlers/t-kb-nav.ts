/**
 * t-kb-nav (§12.2.4, aesthetic §09) — sets the presence flag
 * body[data-v-kb-nav] on first Tab / arrow-key, removes it on first mousedown.
 * This single flag drives the CSS conditional for menu hover vs.
 * active-descendant highlighting. Self-initializes on import (page-level).
 */
import { registerBehavior } from '~/lib2/dom/dispatch';

const KB_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

function enableKb(): void {
	document.body?.setAttribute('data-v-kb-nav', '');
}

function disableKb(): void {
	document.body?.removeAttribute('data-v-kb-nav');
}

let initialized = false;

function initKbNav(): void {
	if (initialized || typeof document === 'undefined') return;
	initialized = true;
	document.addEventListener(
		'keydown',
		(ev) => {
			if (KB_KEYS.has((ev as KeyboardEvent).key)) enableKb();
		},
		true,
	);
	document.addEventListener('mousedown', disableKb, true);
}

initKbNav();

// Registered so the name maps to this file for the SSR purge; the flag logic is
// page-level and needs no per-element token.
registerBehavior('t-kb-nav', {
	mount() {
		initKbNav();
	},
});
