/**
 * `t-kb-nav` — page-level keyboard-vs-mouse mode flag (§12.2.4, Aesthetic spec §09).
 *
 * Sets the presence flag `body[data-v-kb-nav]` (no value) on the first Tab / arrow
 * key, removes it on the first mousedown. This single flag drives CSS conditionals
 * (`[data-v-kb-nav]` / `:not([data-v-kb-nav])`) so mouse users see hover highlights
 * while keyboard users see active-descendant highlights — never both at once.
 *
 * This behavior is page-level: importing the module installs the listeners. There is
 * no producer and no per-element opt-in.
 */
const NAV_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

const ATTR = 'data-v-kb-nav';

let installed = false;

function install(): void {
	if (installed || typeof document === 'undefined') return;
	installed = true;

	document.addEventListener(
		'keydown',
		(ev) => {
			if (NAV_KEYS.has((ev as KeyboardEvent).key)) {
				document.body?.setAttribute(ATTR, '');
			}
		},
		true,
	);
	document.addEventListener(
		'mousedown',
		() => {
			document.body?.removeAttribute(ATTR);
		},
		true,
	);
}

install();
