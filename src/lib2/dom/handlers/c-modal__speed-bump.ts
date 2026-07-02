/**
 * c-modal__speed-bump (§12.1) — marks a nested <dialog> as the "are you sure?"
 * prompt for its parent modal. Orchestration lives entirely here; c-modal knows
 * nothing about it.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { isDirty } from '~/lib2/dom/form';
import { forceClose, onRequestClose } from '~/lib2/dom/handlers/t-request-close';

registerBehavior('c-modal__speed-bump', {
	mount(el) {
		const speedBump = el as HTMLDialogElement;
		const parent = speedBump.parentElement?.closest('dialog');
		if (!(parent instanceof HTMLDialogElement)) return;

		// Veto the parent close if any descendant form is dirty.
		onRequestClose(parent, () => {
			const forms = [...parent.querySelectorAll<HTMLFormElement>('form[data-js~="t-validate"]')];
			if (forms.some((form) => isDirty(form))) {
				speedBump.showModal();
				return false;
			}
			return true;
		});

		// "Discard" closes the parent, bypassing the chain so it doesn't re-open.
		speedBump.addEventListener('close', () => {
			if (speedBump.returnValue === 'discard') forceClose(parent);
		});
	},
});

export function modalSpeedBump() {
	return { 'data-js': concat('c-modal__speed-bump') };
}
