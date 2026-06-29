/**
 * `c-modal__close` — a button that requests its ancestor modal to close (§12.3).
 *
 * Goes through `dialog.requestClose()` so the `t-request-close` chain (speed bump,
 * "discard changes?") still runs.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

registerBehavior('c-modal__close', {
	click(el) {
		const dialog = el.closest<HTMLDialogElement>('dialog') as
			| (HTMLDialogElement & { requestClose?: () => void })
			| null;
		if (!dialog) return;
		if (typeof dialog.requestClose === 'function') dialog.requestClose();
		else dialog.close();
	},
});

/** Producer: turn an element into a modal close trigger. */
export function modalClose() {
	return { 'data-js': concat('c-modal__close') };
}
