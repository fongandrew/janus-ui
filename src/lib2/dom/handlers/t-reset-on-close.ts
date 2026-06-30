/**
 * `t-reset-on-close` — when the ancestor `<dialog>` fires `close`, reset
 * any descendant `<form data-js~="t-reset-on-close">`. This is a
 * document-level capture-phase listener of its own (not the general
 * per-ancestor dispatcher in `dispatch.ts`): the token sits on a
 * *descendant* of the closing dialog, while `dispatch.ts` only walks
 * upward from the event target. `close` doesn't bubble, but a
 * capture-phase document listener still observes it on the way down to
 * the target.
 */

import { JS_ATTR } from '~/lib2/dom/config';
import { registerDocumentSetup } from '~/lib2/dom/document-setup';
import { resetFieldState } from '~/lib2/dom/form/validate';

registerDocumentSetup((doc) => {
	doc.addEventListener(
		'close',
		(ev) => {
			const dialog = ev.target;
			if (!(dialog instanceof HTMLDialogElement)) {
				return;
			}
			for (const form of dialog.querySelectorAll<HTMLFormElement>(
				`form[${JS_ATTR}~="t-reset-on-close"]`,
			)) {
				form.reset();
				resetFieldState(form);
			}
		},
		{ capture: true },
	);
});
