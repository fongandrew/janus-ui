/**
 * t-kb-nav — the keyboard/mouse mode presence flag (§12.2.4, aesthetic spec
 * §09). Sets body[data-v-kb-nav] on first Tab/arrow key, removes it on
 * mousedown. This one flag drives the CSS conditionals so mouse users see
 * hover highlights and keyboard users see active-descendant highlights —
 * never both. Page-level: installs at mount() with no per-element opt-in
 * (a data-js="t-kb-nav" token anywhere keeps the purge scanner including it).
 */
import { onMount, registerBehavior } from '~/lib2/dom/dispatch';

const NAV_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

let installed = false;

function install(): void {
	if (installed || typeof document === 'undefined') return;
	installed = true;
	document.addEventListener(
		'keydown',
		(ev) => {
			if (NAV_KEYS.has(ev.key)) document.body.setAttribute('data-v-kb-nav', '');
		},
		true,
	);
	document.addEventListener(
		'mousedown',
		() => document.body.removeAttribute('data-v-kb-nav'),
		true,
	);
}

registerBehavior('t-kb-nav', { mount: install });
onMount(install);
