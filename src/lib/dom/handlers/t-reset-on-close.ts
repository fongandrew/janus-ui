import { registerBehavior } from '../dispatch';
import { resetValidationState, clearDirty } from '../form/validate';

registerBehavior('t-reset-on-close', {
	close(el) {
		const form = el.closest('form') ?? el.querySelector('form');
		if (form instanceof HTMLFormElement) {
			form.reset();
			resetValidationState(form);
			clearDirty(form);
		}
	},

	toggle(el, ev) {
		const event = ev as ToggleEvent;
		if (event.newState === 'closed') {
			const form = el.closest('form') ?? el.querySelector('form');
			if (form instanceof HTMLFormElement) {
				form.reset();
				resetValidationState(form);
				clearDirty(form);
			}
		}
	},
});
