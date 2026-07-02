/**
 * Form engine (§12.1) — one document-level dispatcher plus the two registries.
 * Installs capture-phase listeners for submit / change / input (validation +
 * submit choreography) and close / toggle (reset-on-close) and the internal
 * success event (close-on-success). Public API re-exported from validate/submit.
 */
import { jsAttr } from '~/lib2/dom/config';

import {
	clearExternalError,
	isFormField,
	isShowingError,
	isTouched,
	markTouched,
	setErrors,
	validateField,
	validateForm,
} from '~/lib2/dom/form/validate';
import { buildFormData, getSubmitHandler, setFormError } from '~/lib2/dom/form/submit';

export * from '~/lib2/dom/form/validate';
export * from '~/lib2/dom/form/submit';

const SUBMIT_SUCCESS = 'janus:submit-success';

let installed = false;

export function initFormEngine(): void {
	if (installed || typeof document === 'undefined') return;
	installed = true;
	document.addEventListener('submit', onSubmit, true);
	document.addEventListener('change', onChange, true);
	document.addEventListener('input', onInput, true);
	document.addEventListener('close', onClose, true);
	document.addEventListener('toggle', onToggle, true);
	document.addEventListener(SUBMIT_SUCCESS, onSuccess, true);
}

function hasBehavior(el: Element, name: string): boolean {
	return (el.getAttribute(jsAttr()) ?? '').split(/\s+/).includes(name);
}

function onChange(ev: Event): void {
	const el = ev.target;
	if (!isFormField(el)) return;
	const form = el.form;
	if (!form || !hasBehavior(form, 't-validate')) return;
	markTouched(el);
	clearExternalError(el);
	void validateField(el);

	const group = el.closest('[data-js~="t-validate-group"]');
	if (group) {
		for (const other of group.querySelectorAll('input, select, textarea')) {
			if (other !== el && isFormField(other) && isTouched(other)) void validateField(other);
		}
	}
}

function onInput(ev: Event): void {
	const el = ev.target;
	if (!isFormField(el)) return;
	const form = el.form;
	if (!form || !hasBehavior(form, 't-validate')) return;
	clearExternalError(el);
	// Live feedback only once a field is already showing an error.
	if (isShowingError(el)) void validateField(el);
}

function onSubmit(ev: Event): void {
	const form = ev.target;
	if (!(form instanceof HTMLFormElement)) return;
	const hasValidate = hasBehavior(form, 't-validate');
	const handler = getSubmitHandler(form);
	const hasSubmit = hasBehavior(form, 't-submit') || !!handler;
	if (!hasValidate && !hasSubmit) return; // let native submit proceed

	ev.preventDefault();
	void (async () => {
		if (hasValidate) {
			const valid = await validateForm(form);
			if (!valid) {
				const invalid = form.querySelector('[aria-invalid="true"]');
				if (invalid instanceof HTMLElement) invalid.focus();
				return;
			}
		}
		if (handler) {
			const result = await handler(buildFormData(form), form);
			if (result.ok) {
				if (result.reset !== false) form.reset();
				form.dispatchEvent(new CustomEvent(SUBMIT_SUCCESS, { bubbles: true }));
			} else {
				if (result.fieldErrors) setErrors(form, result.fieldErrors);
				if (result.formError) setFormError(form, result.formError);
			}
		}
	})();
}

function resetFormsIn(root: Element): void {
	root
		.querySelectorAll<HTMLFormElement>('form[data-js~="t-reset-on-close"]')
		.forEach((form) => form.reset());
}

function onClose(ev: Event): void {
	if (ev.target instanceof HTMLElement) resetFormsIn(ev.target);
}

function onToggle(ev: Event): void {
	if (ev instanceof ToggleEvent && ev.newState === 'closed' && ev.target instanceof HTMLElement) {
		resetFormsIn(ev.target);
	}
}

function onSuccess(ev: Event): void {
	const form = ev.target;
	if (!(form instanceof HTMLElement) || !hasBehavior(form, 't-close-on-success')) return;
	const dialog = form.closest('dialog');
	if (dialog instanceof HTMLDialogElement) dialog.close();
	const popover = form.closest('[popover]');
	if (popover && popover.matches(':popover-open')) (popover as HTMLElement).hidePopover();
}
