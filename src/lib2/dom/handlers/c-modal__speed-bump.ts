/**
 * `c-modal__speed-bump` — marks a nested `<dialog>` as the "are you sure?"
 * prompt for its parent modal (§12.1). All orchestration lives here, not in
 * `c-modal` — the modal stays generic and consumers can build other
 * "are you sure?" patterns on the same shape.
 */

import { JS_ATTR } from '~/lib2/dom/config';
import { registerBehavior } from '~/lib2/dom/dispatch';
import { isDirty } from '~/lib2/dom/form/validate';
import { forceClose, onRequestClose } from '~/lib2/dom/handlers/t-request-close';

function findParentDialog(el: Element): HTMLDialogElement | null {
	let node = el.parentElement;
	while (node) {
		if (node instanceof HTMLDialogElement) {
			return node;
		}
		node = node.parentElement;
	}
	return null;
}

registerBehavior('c-modal__speed-bump', {
	mount(el) {
		if (!(el instanceof HTMLDialogElement)) {
			return;
		}
		const parent = findParentDialog(el);
		if (!parent) {
			return;
		}
		onRequestClose(parent, () => {
			const forms = parent.querySelectorAll<HTMLFormElement>(
				`form[${JS_ATTR}~="t-validate"]`,
			);
			const dirty = Array.from(forms).some((form) => isDirty(form));
			if (dirty) {
				el.showModal();
				return false;
			}
			return true;
		});
	},
	close(el) {
		if (!(el instanceof HTMLDialogElement) || el.returnValue !== 'discard') {
			return;
		}
		const parent = findParentDialog(el);
		if (parent) {
			forceClose(parent);
		}
	},
});
