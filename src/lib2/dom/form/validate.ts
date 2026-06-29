/**
 * Form validation engine (§12.1).
 *
 * One document-level dispatcher plus two registries. Validators register either
 * once at module load (named, via {@link registerValidator}) or by element identity
 * (closure, via {@link addValidator} → WeakMap). A form opts in with
 * `data-js="t-validate"`; the engine walks its members on submit / change / input.
 */
import { jsAttr } from '~/lib2/dom/config';

/**
 * A validator inspects an element and returns an error message string, or `null` /
 * `undefined` if the value is valid. Validators must be synchronous — do async
 * checks in a submit handler and feed results back via {@link setErrors}.
 */
export type Validator<T extends HTMLElement = HTMLElement> = (el: T) => string | null | undefined;

/** Marks an element whose error slot is controlled externally (Solid `errorMessage`). */
const EXTERNAL_ERROR_ATTR = 'data-external-error';
/** Marks the error destination element. */
const VALIDATE_ERROR_TOKEN = 't-validate-error';
/** Marks the form-wide error display. */
const FORM_ERROR_ATTR = 'data-form-error';
/** Sidecar list of named validators on a field. */
const VALIDATORS_ATTR = 'data-validators';

const namedValidators = new Map<string, Validator>();
const inlineValidators = new WeakMap<Element, Set<Validator>>();
const touched = new WeakSet<Element>();
const showingError = new WeakSet<Element>();

/** Register a named validator once at module load. Lives for the page lifetime. */
export function registerValidator<T extends HTMLElement = HTMLElement>(
	name: string,
	fn: Validator<T>,
): void {
	namedValidators.set(name, fn as Validator);
}

/**
 * Attach an inline closure validator to an element, stored in a WeakMap keyed by
 * element identity. Returns a cleanup to remove it while the element is alive
 * (element GC cleans up automatically otherwise).
 */
export function addValidator<T extends HTMLElement>(el: T, fn: Validator<T>): () => void {
	let set = inlineValidators.get(el);
	if (!set) inlineValidators.set(el, (set = new Set()));
	set.add(fn as Validator);
	return () => {
		inlineValidators.get(el)?.delete(fn as Validator);
	};
}

/** Whether an element is excluded from validation / submission (aria-disabled). */
function isAriaDisabled(el: Element): boolean {
	return el.getAttribute('aria-disabled') === 'true';
}

/** All validatable members of a container: native form controls + custom validated elements. */
export function getValidatableElements(container: ParentNode): HTMLElement[] {
	return Array.from(
		container.querySelectorAll<HTMLElement>('input, textarea, select, [data-validators]'),
	);
}

/** The error destination element for a field, found via its `aria-describedby` chain. */
export function getErrorElement(target: HTMLElement): HTMLElement | null {
	const doc = target.ownerDocument;
	const ids = target.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
	for (const id of ids) {
		const el = doc.getElementById(id);
		if (el && el.getAttribute(jsAttr())?.split(/\s+/).includes(VALIDATE_ERROR_TOKEN)) {
			return el;
		}
	}
	return null;
}

/** Write (or clear) the error message for a single field. */
export function setError(target: HTMLElement, msg: string | null): void {
	target.setAttribute('aria-invalid', msg ? 'true' : 'false');
	(target as Partial<HTMLInputElement>).setCustomValidity?.(msg ?? '');

	if (msg) showingError.add(target);
	else showingError.delete(target);

	const errorEl = getErrorElement(target);
	if (errorEl && !errorEl.hasAttribute(EXTERNAL_ERROR_ATTR)) {
		errorEl.textContent = msg ?? '';
		if (msg) errorEl.setAttribute('role', 'alert');
		else errorEl.removeAttribute('role');
	}
}

/** Run the validator chain for one element: native validity → named → inline. */
export function validateField(el: HTMLElement): string | null {
	if (isAriaDisabled(el)) {
		setError(el, null);
		return null;
	}
	touched.add(el);

	// Native HTML5 validity (clear any custom message first so it doesn't shadow).
	(el as Partial<HTMLInputElement>).setCustomValidity?.('');
	if ((el as Partial<HTMLInputElement>).checkValidity?.() === false) {
		const msg = (el as HTMLInputElement).validationMessage;
		setError(el, msg);
		return msg;
	}

	// Named validators from data-validators.
	for (const name of el.getAttribute(VALIDATORS_ATTR)?.split(/\s+/) ?? []) {
		const fn = name && namedValidators.get(name);
		const res = fn && fn(el);
		if (res) {
			setError(el, res);
			return res;
		}
	}

	// Inline closures from the WeakMap.
	const inline = inlineValidators.get(el);
	if (inline) {
		for (const fn of inline) {
			const res = fn(el);
			if (res) {
				setError(el, res);
				return res;
			}
		}
	}

	setError(el, null);
	return null;
}

/** Validate every member of a form. Returns true if any field is invalid. */
export function validateForm(form: HTMLFormElement): boolean {
	let hasErrors = false;
	for (const el of getValidatableElements(form)) {
		if (validateField(el)) hasErrors = true;
	}
	return hasErrors;
}

/** Server-fed errors keyed by field `name`; each persists until that field changes. */
export function setErrors(form: HTMLFormElement, errors: Record<string, string>): void {
	for (const el of getValidatableElements(form)) {
		const name = el.getAttribute('name');
		const msg = name ? errors[name] : undefined;
		if (msg) setError(el, msg);
	}
}

/** Display a form-wide error in the element marked `data-form-error`. */
export function setFormError(form: HTMLFormElement, msg: string): void {
	const el = form.querySelector<HTMLElement>(`[${FORM_ERROR_ATTR}]`);
	if (el) {
		el.textContent = msg;
		if (msg) el.setAttribute('role', 'alert');
	}
}

/** Whether any control in the form differs from its default value (used by the speed bump). */
export function isDirty(form: HTMLFormElement): boolean {
	for (const el of form.querySelectorAll<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	>('input, textarea, select')) {
		if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
			if (el.checked !== el.defaultChecked) return true;
		} else if (el instanceof HTMLSelectElement) {
			const changed = Array.from(el.options).some((o) => o.selected !== o.defaultSelected);
			if (changed) return true;
		} else if ('defaultValue' in el && el.value !== el.defaultValue) {
			return true;
		}
	}
	return false;
}

/** Reset touched / error state for every member of a form. */
export function resetValidation(form: HTMLFormElement): void {
	for (const el of getValidatableElements(form)) {
		touched.delete(el);
		showingError.delete(el);
		setError(el, null);
	}
}

/** Mark every member of a form as touched (used on submit). */
export function touchAll(form: HTMLFormElement): void {
	for (const el of getValidatableElements(form)) touched.add(el);
}

export function isTouched(el: Element): boolean {
	return touched.has(el);
}

export function isShowingError(el: Element): boolean {
	return showingError.has(el);
}

/** Focus (or scroll to) the first invalid control in a container. */
export function focusFirstError(container: HTMLElement): void {
	for (const el of getValidatableElements(container)) {
		if (el.matches(':invalid, [aria-invalid="true"]')) {
			el.focus();
			return;
		}
	}
}
