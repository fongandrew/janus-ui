/**
 * Form validation (§12.1). Two registries (named + WeakMap), a touched-state
 * machine, and per-field dispatch. Field constraints use native HTML5 validity;
 * named/inline validators add custom rules.
 */
import { jsAttr } from '~/lib2/dom/config';

export type Validator = (el: HTMLElement) => string | null | Promise<string | null>;

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const namedValidators = new Map<string, Validator>();
const elementValidators = new WeakMap<Element, Set<Validator>>();
const touched = new WeakSet<Element>();
const showingError = new WeakSet<Element>();
const externalErrors = new WeakMap<Element, string>();

/** Named validator — registered once at module load, referenced from markup. */
export function registerValidator(name: string, fn: Validator): void {
	namedValidators.set(name, fn);
}

/** Inline validator — stored by element identity (no IDs; GC cleans up). */
export function addValidator(el: Element, fn: Validator): () => void {
	let set = elementValidators.get(el);
	if (!set) {
		set = new Set();
		elementValidators.set(el, set);
	}
	set.add(fn);
	return () => set!.delete(fn);
}

export function markTouched(el: Element): void {
	touched.add(el);
}

export function isTouched(el: Element): boolean {
	return touched.has(el);
}

export function isShowingError(el: Element): boolean {
	return showingError.has(el);
}

export function isFormField(el: EventTarget | null): el is FieldElement {
	return (
		el instanceof HTMLInputElement ||
		el instanceof HTMLSelectElement ||
		el instanceof HTMLTextAreaElement
	);
}

export function isAriaDisabled(el: Element): boolean {
	return el.getAttribute('aria-disabled') === 'true';
}

/** Set a server-fed external error for a field (persists until it changes). */
export function setExternalError(el: Element, msg: string): void {
	externalErrors.set(el, msg);
}

export function clearExternalError(el: Element): void {
	externalErrors.delete(el);
}

/** Walk aria-describedby to the first element carrying t-validate-error. */
function errorDestination(el: Element): HTMLElement | null {
	const ids = (el.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
	const attr = jsAttr();
	for (const id of ids) {
		const dest = el.ownerDocument.getElementById(id);
		if (dest && (dest.getAttribute(attr) ?? '').split(/\s+/).includes('t-validate-error')) {
			return dest;
		}
	}
	return null;
}

export function setFieldError(el: Element, msg: string | null): void {
	if (msg) {
		el.setAttribute('aria-invalid', 'true');
		showingError.add(el);
	} else {
		el.removeAttribute('aria-invalid');
		showingError.delete(el);
	}
	const dest = errorDestination(el);
	if (dest) {
		dest.textContent = msg ?? '';
		if (msg) dest.setAttribute('role', 'alert');
		else dest.removeAttribute('role');
	}
}

/** Run the validator chain for one field; returns the first error or null. */
export async function validateField(el: FieldElement): Promise<string | null> {
	if (isAriaDisabled(el)) {
		setFieldError(el, null);
		return null;
	}

	// 1. Native HTML5 validity.
	if (el.willValidate && !el.validity.valid) {
		const msg = el.validationMessage;
		setFieldError(el, msg);
		return msg;
	}

	// 2. Named validators from data-validators.
	const names = (el.getAttribute('data-validators') ?? '').split(/\s+/).filter(Boolean);
	for (const name of names) {
		const fn = namedValidators.get(name);
		if (fn) {
			const r = await fn(el);
			if (r) {
				setFieldError(el, r);
				return r;
			}
		}
	}

	// 3. Inline validators from the WeakMap.
	const set = elementValidators.get(el);
	if (set) {
		for (const fn of set) {
			const r = await fn(el);
			if (r) {
				setFieldError(el, r);
				return r;
			}
		}
	}

	// 4. Server-fed external error.
	const ext = externalErrors.get(el);
	if (ext) {
		setFieldError(el, ext);
		return ext;
	}

	setFieldError(el, null);
	return null;
}

/** Validate every member of a form. Marks all touched. Returns validity. */
export async function validateForm(form: HTMLFormElement): Promise<boolean> {
	const fields = [...form.elements].filter(isFormField);
	let valid = true;
	for (const field of fields) {
		if (!field.name && !field.getAttribute('data-validators') && field.validity.valid) continue;
		markTouched(field);
		const err = await validateField(field);
		if (err) valid = false;
	}
	return valid;
}

/** Set server-fed errors keyed by field name. */
export function setErrors(form: HTMLFormElement, errors: Record<string, string>): void {
	for (const [name, msg] of Object.entries(errors)) {
		const el = form.elements.namedItem(name);
		if (el instanceof HTMLElement) {
			setExternalError(el, msg);
			setFieldError(el, msg);
		}
	}
}
