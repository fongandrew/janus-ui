import { registerBehavior } from '../dispatch';
import { onRequestClose, forceClose } from './t-request-close';
import { isDirty } from '../form/validate';

registerBehavior('c-modal-speed-bump', {
	mount(el) {
		const parentModal = el.closest('dialog:not(:scope)') ??
			el.parentElement?.closest('dialog');
		if (!parentModal || !(parentModal instanceof HTMLDialogElement)) return;

		onRequestClose(parentModal, () => {
			const forms = parentModal.querySelectorAll('form[data-js~="t-validate"]');
			for (const form of forms) {
				if (form instanceof HTMLFormElement && isDirty(form)) {
					if (el instanceof HTMLDialogElement) {
						el.showModal();
					}
					return false;
				}
			}
			return true;
		});

		el.addEventListener('close', () => {
			if (el instanceof HTMLDialogElement && el.returnValue === 'discard') {
				forceClose(parentModal);
			}
		});
	},
});
