/**
 * The form engine's validation half (§12.1): two registries (named at
 * module load, closures in a WeakMap), the touched-state machine, and the
 * per-field dispatch logic. No per-element listeners, no runtime IDs.
 */
import { jsAttr } from '~/lib2/dom/config';

export type Validator = (el: FormMember) => string | null | undefined;

export type FormMember = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Named validators — registered once at module load. */
const namedValidators = new Map<string, Validator>();

/** Inline closures — keyed by element identity; GC cleans up automatically. */
const inlineValidators = new WeakMap<Element, Set<Validator>>();

/** Server-fed errors keyed by element; cleared when the user edits. */
const externalErrors = new WeakMap<Element, string>();

/** Touched after first change (or form submit); errors only show on touched fields. */
const touched = new WeakSet<Element>();

/** Fields currently showing an error validate live on input. */
const liveFields = new WeakSet<Element>();

export function registerValidator(name: string, fn: Validator): void {
	namedValidators.set(name, fn);
}

export function addValidator(el: Element, fn: Validator): () => void {
	let set = inlineValidators.get(el);
	if (!set) {
		set = new Set();
		inlineValidators.set(el, set);
	}
	set.add(fn);
	return () => set.delete(fn);
}

export function isFormMember(el: unknown): el is FormMember {
	return (
		el instanceof HTMLInputElement ||
		el instanceof HTMLSelectElement ||
		el instanceof HTMLTextAreaElement
	);
}

function isAriaDisabled(el: Element): boolean {
	return el.getAttribute('aria-disabled') === 'true';
}

export function markTouched(el: Element): void {
	touched.add(el);
}

export function isTouched(el: Element): boolean {
	return touched.has(el);
}

export function isLive(el: Element): boolean {
	return liveFields.has(el);
}

/** Server-fed errors, keyed by field name — persist until the field changes. */
export function setErrors(form: HTMLFormElement, errors: Record<string, string>): void {
	for (const [name, message] of Object.entries(errors)) {
		const el = form.elements.namedItem(name);
		if (isFormMember(el)) {
			externalErrors.set(el, message);
			touched.add(el);
			showError(el, message);
		}
	}
}

export function clearExternalError(el: Element): void {
	externalErrors.delete(el);
}

/**
 * Compute the error for one field: HTML5 native validity → named validators
 * from data-validators → inline WeakMap validators → server-fed error.
 * First non-null wins. aria-disabled fields never error (§12.1).
 */
export function computeError(el: FormMember): string | null {
	if (isAriaDisabled(el)) return null;

	const external = externalErrors.get(el);
	if (external) return external;

	if (!el.validity.valid) return el.validationMessage;

	const named = el.getAttribute('data-validators');
	if (named) {
		for (const name of named.split(/\s+/)) {
			const fn = namedValidators.get(name);
			const message = fn?.(el);
			if (message) return message;
		}
	}

	const inline = inlineValidators.get(el);
	if (inline) {
		for (const fn of inline) {
			const message = fn(el);
			if (message) return message;
		}
	}

	return null;
}

/**
 * Find the field's error destination: walk aria-describedby, take the first
 * element carrying the t-validate-error behavior (§12.1).
 */
export function errorDestination(el: Element): Element | null {
	const describedBy = el.getAttribute('aria-describedby');
	if (!describedBy) return null;
	const doc = el.ownerDocument;
	for (const id of describedBy.split(/\s+/)) {
		const candidate = doc.getElementById(id);
		if (
			candidate &&
			(candidate.getAttribute(jsAttr()) ?? '').split(/\s+/).includes('t-validate-error')
		) {
			return candidate;
		}
	}
	return null;
}

export function showError(el: FormMember, message: string): void {
	el.setAttribute('aria-invalid', 'true');
	liveFields.add(el);
	const destination = errorDestination(el);
	if (destination) {
		destination.textContent = message;
		destination.setAttribute('role', 'alert');
	}
}

export function clearError(el: FormMember): void {
	el.removeAttribute('aria-invalid');
	const destination = errorDestination(el);
	if (destination) {
		destination.textContent = '';
		destination.removeAttribute('role');
	}
}

/** Validate one field, writing/clearing its error. Returns the error. */
export function validateField(el: FormMember): string | null {
	const message = computeError(el);
	if (message) showError(el, message);
	else clearError(el);
	return message;
}

export function formMembers(form: HTMLFormElement): FormMember[] {
	return Array.from(form.elements).filter(isFormMember);
}

/**
 * Validate every member (marking them touched — used on submit).
 * Returns the first invalid member, or null when the form is clean.
 */
export function validateForm(form: HTMLFormElement): FormMember | null {
	let firstInvalid: FormMember | null = null;
	for (const member of formMembers(form)) {
		touched.add(member);
		const message = validateField(member);
		if (message && !firstInvalid) firstInvalid = member;
	}
	return firstInvalid;
}

/** Dirty check: any member's value differs from its default (§12.1 speed bump). */
export function isDirty(form: HTMLFormElement): boolean {
	for (const member of formMembers(form)) {
		if (member instanceof HTMLInputElement) {
			if (member.type === 'checkbox' || member.type === 'radio') {
				if (member.checked !== member.defaultChecked) return true;
			} else if (member.value !== member.defaultValue) {
				return true;
			}
		} else if (member instanceof HTMLTextAreaElement) {
			if (member.value !== member.defaultValue) return true;
		} else if (member instanceof HTMLSelectElement) {
			for (const option of member.options) {
				if (option.selected !== option.defaultSelected) return true;
			}
		}
	}
	return false;
}

/** Reset a form and clear every member's error UI + touch state. */
export function resetForm(form: HTMLFormElement): void {
	form.reset();
	for (const member of formMembers(form)) {
		externalErrors.delete(member);
		touched.delete(member);
		liveFields.delete(member);
		clearError(member);
	}
}
