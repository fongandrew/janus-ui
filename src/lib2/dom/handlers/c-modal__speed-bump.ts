/**
 * `c-modal__speed-bump` — "are you sure?" prompt for a dirty modal close (§12.1).
 *
 * The consumer renders a nested `<dialog data-js="c-modal__speed-bump">` inside the
 * modal. This module owns the orchestration entirely — `c-modal` knows nothing about
 * speed bumps:
 *
 * 1. On mount, walk up to the parent `<dialog>` (the modal).
 * 2. Register an `onRequestClose` hook: if any form in the modal is dirty, show the
 *    speed bump and cancel the parent close.
 * 3. On the speed bump's own `close`, if `returnValue === 'discard'`, `forceClose`
 *    the parent modal (bypassing the chain so the hook doesn't re-fire).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { isDirty } from '~/lib2/dom/form/validate';
import { forceClose, onRequestClose } from '~/lib2/dom/handlers/t-request-close';

const wired = new WeakSet<Element>();

registerBehavior('c-modal__speed-bump', {
	mount(speedBump) {
		if (wired.has(speedBump)) return;
		wired.add(speedBump);

		const parent = speedBump.parentElement?.closest<HTMLDialogElement>('dialog');
		if (!parent) return;

		onRequestClose(parent, () => {
			const dirty = Array.from(
				parent.querySelectorAll<HTMLFormElement>('form[data-js~="t-validate"]'),
			).some((form) => isDirty(form));
			if (dirty) {
				(speedBump as HTMLDialogElement).showModal();
				return false;
			}
			return true;
		});
	},
	close(speedBump) {
		const dialog = speedBump as HTMLDialogElement;
		if (dialog.returnValue !== 'discard') return;
		const parent = speedBump.parentElement?.closest<HTMLDialogElement>('dialog');
		if (parent) forceClose(parent);
	},
});

/** Producer: mark a nested dialog as the speed-bump prompt for its parent modal. */
export function modalSpeedBump() {
	return { 'data-js': concat('c-modal__speed-bump') };
}
