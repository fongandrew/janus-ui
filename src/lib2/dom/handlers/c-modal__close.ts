/**
 * c-modal__close (§12.3) — a button that requests close of its ancestor
 * <dialog>, running the requestClose chain (so a speed bump can veto).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { tryClose } from '~/lib2/dom/handlers/t-request-close';

registerBehavior('c-modal__close', {
	click(el) {
		const dialog = el.closest('dialog');
		if (dialog instanceof HTMLDialogElement) tryClose(dialog);
	},
});

export function modalClose() {
	return { 'data-js': concat('c-modal__close') };
}
