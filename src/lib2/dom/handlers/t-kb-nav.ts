/**
 * `t-kb-nav` — page-level, no producer, no `data-js` opt-in. Sets the
 * presence flag `body[data-v-kb-nav]` on first Tab / arrow-key, removes it
 * on first mousedown. Drives the CSS conditional between menu hover
 * highlights (mouse mode) and active-descendant highlights (keyboard mode).
 * Importing this module installs its listeners as a side effect.
 */

import { registerDocumentSetup } from '~/lib2/dom/document-setup';

const NAV_KEYS = new Set(['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']);

registerDocumentSetup((doc) => {
	doc.addEventListener(
		'keydown',
		(ev) => {
			if (NAV_KEYS.has((ev as KeyboardEvent).key)) {
				doc.body.setAttribute('data-v-kb-nav', '');
			}
		},
		{ capture: true },
	);

	doc.addEventListener(
		'mousedown',
		() => {
			doc.body.removeAttribute('data-v-kb-nav');
		},
		{ capture: true },
	);
});
