/**
 * t-validate — the form engine's validation behavior (§12.1). Rides the
 * general dispatcher: change/input events bubble from fields to the form
 * carrying the token. Touched-only display; after a field first shows an
 * error it re-validates live on input.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { jsAttr } from '~/lib2/dom/config';
import { registerBehavior } from '~/lib2/dom/dispatch';
import {
	clearExternalError,
	isFormMember,
	isLive,
	isTouched,
	markTouched,
	validateField,
	validateForm,
} from '~/lib2/dom/form/validate';

function tokensOf(el: Element): string[] {
	return (el.getAttribute(jsAttr()) ?? '').split(/\s+/);
}

registerBehavior('t-validate', {
	change(_form, ev: Event) {
		const field = ev.target;
		if (!isFormMember(field)) return;
		markTouched(field);
		clearExternalError(field);
		validateField(field);

		// Group validation: every other TOUCHED child of the enclosing
		// t-validate-group fieldset re-validates (§12.1).
		const group = field.closest('fieldset');
		if (group && tokensOf(group).includes('t-validate-group')) {
			for (const el of group.elements) {
				if (el !== field && isFormMember(el) && isTouched(el)) validateField(el);
			}
		}
	},

	input(_form, ev: Event) {
		const field = ev.target;
		if (!isFormMember(field)) return;
		clearExternalError(field);
		// Live feedback only once the field has shown its first error
		if (isLive(field)) validateField(field);
	},

	submit(form, ev: Event) {
		// When t-submit is present it owns the full choreography.
		if (tokensOf(form).includes('t-submit')) return;
		const firstInvalid = validateForm(form as HTMLFormElement);
		if (firstInvalid) {
			ev.preventDefault();
			firstInvalid.focus();
		}
	},
});

export function validate() {
	return { 'data-js': concat('t-validate') };
}
