/**
 * The validation half of the form engine (§12.1). One set of document-level
 * capture-mode `change`/`input` listeners, plus two validator registries
 * (named + WeakMap), drive every `<form data-js~="t-validate">`. No
 * per-element listeners, no per-render IDs.
 */

import { JS_ATTR } from '~/lib2/dom/config';
import { registerDocumentSetup } from '~/lib2/dom/document-setup';

export type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export type Validator<E extends Element = FormField> = (el: E) => string | null;

function isFormField(el: Element): el is FormField {
	return (
		el instanceof HTMLInputElement ||
		el instanceof HTMLSelectElement ||
		el instanceof HTMLTextAreaElement
	);
}

function isFieldDisabled(el: Element): boolean {
	return (
		el.getAttribute('aria-disabled') === 'true' ||
		('disabled' in el && (el as HTMLInputElement).disabled)
	);
}

function tokens(el: Element): string[] {
	return (el.getAttribute(JS_ATTR) ?? '').split(/\s+/).filter(Boolean);
}

function formFields(form: HTMLFormElement): FormField[] {
	return Array.from(form.elements).filter(isFormField);
}

// 1. Named validators -- registered once at module load.
const namedValidators = new Map<string, Validator<any>>();

/** Register a validator by name, referenced from markup via `data-validators="name"`. */
export function registerValidator(name: string, fn: Validator<any>): void {
	namedValidators.set(name, fn);
}

// 2. Inline closures -- keyed by element identity, GC'd with the element.
const elementValidators = new WeakMap<Element, Set<Validator<any>>>();

/** Attach a validator closure to an element. Returns a cleanup that detaches it. */
export function addValidator<E extends Element = FormField>(el: E, fn: Validator<E>): () => void {
	let set = elementValidators.get(el);
	if (!set) {
		set = new Set();
		elementValidators.set(el, set);
	}
	set.add(fn as Validator<any>);
	return () => {
		elementValidators.get(el)?.delete(fn as Validator<any>);
	};
}

// Touched-state machine.
const touchedFields = new WeakSet<Element>();
// Fields that have shown an error once -- validate on `input` too, for live feedback.
const liveFields = new WeakSet<Element>();
// Fields currently displaying a server-fed error (setErrors) -- cleared on next change.
const externallyErroredFields = new WeakSet<Element>();

/** Whether a field has been touched (first `change`, or the owning form submitted). */
export function isTouched(el: Element): boolean {
	return touchedFields.has(el);
}

function touch(el: Element): void {
	touchedFields.add(el);
}

/** Mark every field in the form touched -- called by the submit dispatcher so a first submit reveals every error. */
export function touchAll(form: HTMLFormElement): void {
	for (const el of formFields(form)) {
		touch(el);
	}
}

/** Clear touched/live/external-error tracking for every field in the form. Used after a programmatic `form.reset()`. */
export function resetFieldState(form: HTMLFormElement): void {
	for (const el of formFields(form)) {
		touchedFields.delete(el);
		liveFields.delete(el);
		externallyErroredFields.delete(el);
		writeError(el, null);
	}
}

function findErrorDestination(el: Element): HTMLElement | null {
	const describedBy = el.getAttribute('aria-describedby');
	if (!describedBy) {
		return null;
	}
	for (const id of describedBy.split(/\s+/).filter(Boolean)) {
		const candidate = el.ownerDocument.getElementById(id);
		if (candidate && tokens(candidate).includes('t-validate-error')) {
			return candidate;
		}
	}
	return null;
}

function writeError(el: Element, message: string | null): void {
	if (message) {
		el.setAttribute('aria-invalid', 'true');
	} else {
		el.removeAttribute('aria-invalid');
	}
	const dest = findErrorDestination(el);
	if (!dest || dest.hasAttribute('data-external-error')) {
		return;
	}
	dest.textContent = message ?? '';
	if (message) {
		dest.setAttribute('role', 'alert');
	} else {
		dest.removeAttribute('role');
	}
}

/** Run the validator chain for one field: HTML5 validity -> named -> inline. First non-null message wins. */
export function runValidators(el: FormField): string | null {
	if (isFieldDisabled(el)) {
		return null;
	}
	if (!el.validity.valid) {
		return el.validationMessage || 'Invalid value';
	}
	for (const name of (el.getAttribute('data-validators') ?? '').split(/\s+/).filter(Boolean)) {
		const message = namedValidators.get(name)?.(el);
		if (message) {
			return message;
		}
	}
	for (const fn of elementValidators.get(el) ?? []) {
		const message = fn(el);
		if (message) {
			return message;
		}
	}
	return null;
}

/** Validate a single field and, if touched (or `reveal`), write its message to the error destination. */
function validateAndReveal(el: FormField, reveal: boolean): string | null {
	externallyErroredFields.delete(el);
	const message = runValidators(el);
	if (reveal) {
		writeError(el, message);
		if (message) {
			liveFields.add(el);
		} else {
			liveFields.delete(el);
		}
	}
	return message;
}

/** Validate every field in the form. Writes error text for touched fields. Returns whether the whole form is valid. */
export function validateForm(form: HTMLFormElement): boolean {
	let valid = true;
	for (const el of formFields(form)) {
		if (isFieldDisabled(el)) {
			continue;
		}
		const message = validateAndReveal(el, isTouched(el));
		if (message) {
			valid = false;
		}
	}
	return valid;
}

/** Server-fed field errors, keyed by field `name`. Persist until the user changes that field. */
export function setErrors(form: HTMLFormElement, errors: Record<string, string>): void {
	for (const [name, message] of Object.entries(errors)) {
		const item = form.elements.namedItem(name);
		const field = item instanceof RadioNodeList ? item[0] : item;
		if (!field || !(field instanceof Element)) {
			continue;
		}
		externallyErroredFields.add(field);
		touch(field);
		writeError(field, message);
	}
}

/** Form-wide error text, written into the element carrying `data-js~="t-validate-error"` and `data-form-error`. */
export function setFormError(form: HTMLFormElement, message: string | null): void {
	const dest = form.querySelector<HTMLElement>(
		`[${JS_ATTR}~="t-validate-error"][data-form-error]`,
	);
	if (!dest || dest.hasAttribute('data-external-error')) {
		return;
	}
	dest.textContent = message ?? '';
	if (message) {
		dest.setAttribute('role', 'alert');
	} else {
		dest.removeAttribute('role');
	}
}

/** Whether any field's current value differs from its default. Used by the modal-form speed bump. */
export function isDirty(form: HTMLFormElement): boolean {
	for (const el of formFields(form)) {
		if (el instanceof HTMLInputElement) {
			if (el.type === 'checkbox' || el.type === 'radio') {
				if (el.checked !== el.defaultChecked) {
					return true;
				}
			} else if (el.value !== el.defaultValue) {
				return true;
			}
		} else if (el instanceof HTMLTextAreaElement) {
			if (el.value !== el.defaultValue) {
				return true;
			}
		} else if (el instanceof HTMLSelectElement) {
			for (const opt of el.options) {
				if (opt.selected !== opt.defaultSelected) {
					return true;
				}
			}
		}
	}
	return false;
}

function owningValidatedForm(el: FormField): HTMLFormElement | null {
	const form = el.form;
	if (!form || !tokens(form).includes('t-validate')) {
		return null;
	}
	return form;
}

function handleChange(ev: Event): void {
	const target = ev.target;
	if (!(target instanceof Element) || !isFormField(target)) {
		return;
	}
	const form = owningValidatedForm(target);
	if (!form || isFieldDisabled(target)) {
		return;
	}
	touch(target);
	validateAndReveal(target, true);

	const group = target.closest(`[${JS_ATTR}~="t-validate-group"]`);
	if (group) {
		for (const sibling of formFields(form)) {
			if (
				sibling !== target &&
				group.contains(sibling) &&
				isTouched(sibling) &&
				!isFieldDisabled(sibling)
			) {
				validateAndReveal(sibling, true);
			}
		}
	}
}

function handleInput(ev: Event): void {
	const target = ev.target;
	if (!(target instanceof Element) || !isFormField(target) || !liveFields.has(target)) {
		return;
	}
	const form = owningValidatedForm(target);
	if (!form || isFieldDisabled(target)) {
		return;
	}
	validateAndReveal(target, true);
}

registerDocumentSetup((doc) => {
	doc.addEventListener('change', handleChange, { capture: true });
	doc.addEventListener('input', handleInput, { capture: true });
});

/**
 * Clears the named-validator registry. Test-only. Touched/live/external-error
 * tracking is keyed by element identity (WeakSet) so it doesn't need
 * resetting between tests that create fresh elements.
 */
export function _resetValidateForTests(): void {
	namedValidators.clear();
}
