import { registerBehavior } from '../dispatch';
import {
	isTouched,
	markTouched,
	markDirty,
	clearServerError,
	validateElement,
	writeError,
	enableLiveValidation,
	isLiveValidating,
} from '../form/validate';

function getOwnerForm(el: Element): HTMLFormElement | null {
	return el.closest('form[data-js~="t-validate"]');
}

registerBehavior('t-validate', {
	change(el, ev) {
		const target = ev.target as HTMLElement;
		const form = getOwnerForm(target);
		if (!form || form !== el) return;

		markTouched(target);
		markDirty(target);
		clearServerError(target);

		validateElement(target).then((msg) => {
			if (msg) enableLiveValidation(target);
			writeError(target, msg);
		});
	},

	input(el, ev) {
		const target = ev.target as HTMLElement;
		const form = getOwnerForm(target);
		if (!form || form !== el) return;

		markDirty(target);
		clearServerError(target);

		if (isLiveValidating(target) || isTouched(target)) {
			validateElement(target).then((msg) => {
				writeError(target, msg);
			});
		}
	},

	focusout(el, ev) {
		const target = ev.target as HTMLElement;
		const form = getOwnerForm(target);
		if (!form || form !== el) return;

		if (!isTouched(target)) {
			markTouched(target);
		}
	},
});
