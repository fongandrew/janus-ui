/**
 * c-modal__close — component-internal behavior: a click requests the
 * ancestor dialog's close through the request-close chain (so speed bumps
 * and other hooks can veto).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';

registerBehavior('c-modal__close', {
	click(el) {
		const dialog = el.closest('dialog');
		if (dialog) requestClose(dialog);
	},
});

export function modalClose() {
	return { 'data-js': concat('c-modal__close') };
}
