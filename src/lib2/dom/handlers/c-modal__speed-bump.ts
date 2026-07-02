/**
 * c-modal__speed-bump — marks a nested <dialog> as the "are you sure?"
 * prompt for its parent modal (§12.1). The orchestration lives entirely
 * here — c-modal's code knows nothing about speed bumps:
 *
 * 1. mount: walk up to the ancestor dialog; hook its request-close chain.
 * 2. The hook: if any t-validate form in the parent is dirty, show the
 *    speed bump and cancel the close.
 * 3. On the speed bump's own close with returnValue "discard", forceClose
 *    the parent — bypassing the chain so the hook doesn't re-fire.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { jsAttr } from '~/lib2/dom/config';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { isDirty } from '~/lib2/dom/form/validate';
import { forceClose, onRequestClose } from '~/lib2/dom/handlers/t-request-close';

const wired = new WeakSet<Element>();

registerBehavior('c-modal__speed-bump', {
	mount(el) {
		if (wired.has(el) || !(el instanceof HTMLDialogElement)) return;
		wired.add(el);

		const parentModal = el.parentElement?.closest('dialog');
		if (!parentModal) return;

		onRequestClose(parentModal, () => {
			const attr = jsAttr();
			for (const form of parentModal.querySelectorAll('form')) {
				if (
					(form.getAttribute(attr) ?? '').split(/\s+/).includes('t-validate') &&
					isDirty(form)
				) {
					el.showModal();
					return false;
				}
			}
			return true;
		});

		el.addEventListener('close', () => {
			if (el.returnValue === 'discard') forceClose(parentModal);
		});
	},
});

export function modalSpeedBump() {
	return { 'data-js': concat('c-modal__speed-bump') };
}
