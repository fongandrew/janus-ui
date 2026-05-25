import {
	markAllTouched,
	validateElement,
	writeError,
	resetValidationState,
	clearDirty,
} from './validate';

export type SubmitResult =
	| { ok: true; reset?: boolean }
	| { ok: false; fieldErrors?: Record<string, string>; formError?: string };

export type SubmitHandler = (
	data: FormData,
	form: HTMLFormElement,
) => SubmitResult | Promise<SubmitResult>;

const namedHandlers = new Map<string, SubmitHandler>();
const elementHandlers = new WeakMap<HTMLFormElement, SubmitHandler>();
const submittingForms = new WeakSet<HTMLFormElement>();

export function registerSubmitHandler(name: string, fn: SubmitHandler): void {
	namedHandlers.set(name, fn);
}

export function addSubmitHandler(form: HTMLFormElement, fn: SubmitHandler): () => void {
	elementHandlers.set(form, fn);
	return () => {
		elementHandlers.delete(form);
	};
}

export function isSubmitting(form: HTMLFormElement): boolean {
	return submittingForms.has(form);
}

function getHandler(form: HTMLFormElement): SubmitHandler | undefined {
	const inline = elementHandlers.get(form);
	if (inline) return inline;
	const name = form.getAttribute('data-submit-handler');
	if (name) return namedHandlers.get(name);
	return undefined;
}

function buildFormData(form: HTMLFormElement): FormData {
	const data = new FormData();
	for (const el of Array.from(form.elements) as HTMLElement[]) {
		if (el.getAttribute('aria-disabled') === 'true') continue;
		if (el instanceof HTMLInputElement) {
			if (el.name) {
				if (el.type === 'checkbox') {
					if (el.checked) data.append(el.name, el.value || 'on');
				} else if (el.type === 'radio') {
					if (el.checked) data.append(el.name, el.value);
				} else if (el.type === 'file') {
					for (const file of Array.from(el.files ?? [])) {
						data.append(el.name, file);
					}
				} else {
					data.append(el.name, el.value);
				}
			}
		} else if (el instanceof HTMLSelectElement) {
			if (el.name) {
				for (const opt of Array.from(el.selectedOptions)) {
					data.append(el.name, opt.value);
				}
			}
		} else if (el instanceof HTMLTextAreaElement) {
			if (el.name) data.append(el.name, el.value);
		}
	}
	return data;
}

export function setErrors(form: HTMLFormElement, errors: Record<string, string>): void {
	for (const [name, msg] of Object.entries(errors)) {
		const el = form.elements.namedItem(name);
		if (el instanceof HTMLElement) {
			writeError(el, msg);
		}
	}
}

export function setFormError(form: HTMLFormElement, msg: string): void {
	const errorEl = form.querySelector('[data-js~="t-form-error"]');
	if (errorEl) {
		errorEl.textContent = msg;
		errorEl.setAttribute('role', 'alert');
	}
}

function clearFormError(form: HTMLFormElement): void {
	const errorEl = form.querySelector('[data-js~="t-form-error"]');
	if (errorEl) {
		errorEl.textContent = '';
		errorEl.removeAttribute('role');
	}
}

export async function handleSubmit(form: HTMLFormElement): Promise<void> {
	if (submittingForms.has(form)) return;

	markAllTouched(form);

	let hasErrors = false;
	for (const el of Array.from(form.elements) as HTMLElement[]) {
		const msg = await validateElement(el);
		writeError(el, msg);
		if (msg) {
			if (!hasErrors) {
				el.focus();
			}
			hasErrors = true;
		}
	}
	if (hasErrors) return;

	const handler = getHandler(form);
	if (!handler) return;

	submittingForms.add(form);
	form.setAttribute('aria-busy', 'true');
	clearFormError(form);

	try {
		const data = buildFormData(form);
		const result = await handler(data, form);

		if (result.ok) {
			if (result.reset !== false) {
				form.reset();
				resetValidationState(form);
				clearDirty(form);
			}
			form.dispatchEvent(new CustomEvent('janus:submit-success', { bubbles: true }));
		} else {
			if (result.fieldErrors) {
				setErrors(form, result.fieldErrors);
			}
			if (result.formError) {
				setFormError(form, result.formError);
			}
			form.dispatchEvent(new CustomEvent('janus:submit-error', { bubbles: true }));
		}
	} finally {
		submittingForms.delete(form);
		form.removeAttribute('aria-busy');
	}
}
