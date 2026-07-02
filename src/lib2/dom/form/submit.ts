/**
 * The form engine's submit half (§12.1): named + WeakMap handler registries,
 * disabled-state filtering, and the submit choreography (preventDefault →
 * validate → collect → dispatch → apply result). Consumers' handlers are
 * just business logic.
 */
import {
	formMembers,
	isFormMember,
	resetForm,
	setErrors,
	showError,
	validateForm,
} from '~/lib2/dom/form/validate';

export type SubmitResult =
	| { ok: true; reset?: boolean }
	| { ok: false; fieldErrors?: Record<string, string>; formError?: string };

export type SubmitHandler = (
	data: FormData,
	form: HTMLFormElement,
) => SubmitResult | Promise<SubmitResult>;

const namedHandlers = new Map<string, SubmitHandler>();
const inlineHandlers = new WeakMap<HTMLFormElement, SubmitHandler>();

/** Forms currently mid-submit (prevents double submission). */
const pending = new WeakSet<HTMLFormElement>();

export function registerSubmitHandler(name: string, fn: SubmitHandler): void {
	namedHandlers.set(name, fn);
}

export function addSubmitHandler(form: HTMLFormElement, fn: SubmitHandler): () => void {
	inlineHandlers.set(form, fn);
	return () => {
		if (inlineHandlers.get(form) === fn) inlineHandlers.delete(form);
	};
}

export function handlerFor(form: HTMLFormElement): SubmitHandler | undefined {
	const inline = inlineHandlers.get(form);
	if (inline) return inline;
	const name = form.getAttribute('data-submit-handler');
	return name ? namedHandlers.get(name) : undefined;
}

/**
 * Build FormData excluding aria-disabled members (§12.1): same outcome as
 * native disabled, without removing the element from tab order or
 * screen-reader output. This is the runtime contract behind the Solid
 * layer's ariaize() rule.
 */
export function collectFormData(form: HTMLFormElement): FormData {
	const disabled: FormMemberLike[] = [];
	for (const el of Array.from(form.elements)) {
		if (isFormMember(el) && el.getAttribute('aria-disabled') === 'true' && !el.disabled) {
			el.disabled = true;
			disabled.push(el);
		}
	}
	try {
		return new FormData(form);
	} finally {
		for (const el of disabled) el.disabled = false;
	}
}

type FormMemberLike = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** Write a form-wide error to the form-level destination. */
export function setFormError(form: HTMLFormElement, message: string): void {
	const destination = form.querySelector('[data-form-error]');
	if (destination) {
		destination.textContent = message;
		destination.setAttribute('role', 'alert');
	}
}

export function clearFormError(form: HTMLFormElement): void {
	const destination = form.querySelector('[data-form-error]');
	if (destination) {
		destination.textContent = '';
		destination.removeAttribute('role');
	}
}

export interface SubmitOptions {
	/** Run validation before dispatching (t-validate present). */
	validate: boolean;
	/** Called on { ok: true } after reset (t-close-on-success wiring). */
	onSuccess?: ((form: HTMLFormElement) => void) | undefined;
}

/**
 * The full submit choreography (§12.1). Returns the handler result, or null
 * when validation blocked the submit / no handler ran.
 */
export async function performSubmit(
	form: HTMLFormElement,
	options: SubmitOptions,
): Promise<SubmitResult | null> {
	if (pending.has(form)) return null;

	if (options.validate) {
		const firstInvalid = validateForm(form);
		if (firstInvalid) {
			firstInvalid.focus();
			return null;
		}
	}

	const handler = handlerFor(form);
	if (!handler) return null;

	clearFormError(form);
	pending.add(form);
	try {
		const data = collectFormData(form);
		const result = await handler(data, form);
		if (result.ok) {
			if (result.reset !== false) resetForm(form);
			options.onSuccess?.(form);
		} else {
			if (result.fieldErrors) {
				setErrors(form, result.fieldErrors);
				// Focus the first field carrying a server error
				for (const member of formMembers(form)) {
					if (member.name && result.fieldErrors[member.name]) {
						member.focus();
						break;
					}
				}
			}
			if (result.formError) setFormError(form, result.formError);
		}
		return result;
	} catch (error) {
		setFormError(form, error instanceof Error ? error.message : 'Something went wrong');
		return { ok: false, formError: String(error) };
	} finally {
		pending.delete(form);
	}
}

// Re-export so handlers can show individual field errors on demand
export { showError };
