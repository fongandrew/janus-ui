import { registerBehavior } from '../dispatch';

registerBehavior('t-close-on-success', {
	'janus:submit-success'(el) {
		const dialog = el.closest('dialog');
		if (dialog) {
			dialog.close();
			return;
		}
		const popover = el.closest('[popover]');
		if (popover instanceof HTMLElement) {
			popover.hidePopover();
		}
	},
});
