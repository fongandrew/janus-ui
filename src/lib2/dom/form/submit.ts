/**
 * Form submission (§12.1). Same registry + WeakMap pattern as validators. The
 * dispatcher owns the choreography (preventDefault → validate → build FormData
 * → handler → apply errors / reset); the consumer's handler is business logic.
 */
import { isAriaDisabled, isFormField } from '~/lib2/dom/form/validate';

export type SubmitResult =
	| { ok: true; reset?: boolean }
	| { ok: false; fieldErrors?: Record<string, string>; formError?: string };

export type SubmitHandler = (
	data: FormData,
	form: HTMLFormElement,
) => SubmitResult | Promise<SubmitResult>;

const namedHandlers = new Map<string, SubmitHandler>();
const elementHandlers = new WeakMap<HTMLFormElement, SubmitHandler>();

/** Named submit handler — registered once at module load. */
export function registerSubmitHandler(name: string, fn: SubmitHandler): void {
	namedHandlers.set(name, fn);
}

/** Inline submit handler — stored by form identity. */
export function addSubmitHandler(form: HTMLFormElement, fn: SubmitHandler): () => void {
	elementHandlers.set(form, fn);
	return () => elementHandlers.delete(form);
}

export function getSubmitHandler(form: HTMLFormElement): SubmitHandler | undefined {
	return (
		elementHandlers.get(form) ??
		namedHandlers.get(form.getAttribute('data-submit-handler') ?? '')
	);
}

/** Build FormData, excluding aria-disabled fields (§12.1 disabled filtering). */
export function buildFormData(form: HTMLFormElement): FormData {
	const data = new FormData(form);
	for (const el of form.elements) {
		if (isFormField(el) && el.name && isAriaDisabled(el)) data.delete(el.name);
	}
	return data;
}

/** Write a form-wide error into the `[data-form-error]` destination. */
export function setFormError(form: HTMLFormElement, msg: string): void {
	const dest = form.querySelector('[data-form-error]');
	if (dest) {
		dest.textContent = msg;
		if (msg) dest.setAttribute('role', 'alert');
		else dest.removeAttribute('role');
	}
}

/** Whether any field differs from its default (used by the speed bump). */
export function isDirty(form: HTMLFormElement): boolean {
	for (const el of form.elements) {
		if (!isFormField(el)) continue;
		if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
			if (el.checked !== el.defaultChecked) return true;
		} else if (el instanceof HTMLSelectElement) {
			for (const opt of el.options) if (opt.selected !== opt.defaultSelected) return true;
		} else if (el.value !== (el as HTMLInputElement | HTMLTextAreaElement).defaultValue) {
			return true;
		}
	}
	return false;
}
