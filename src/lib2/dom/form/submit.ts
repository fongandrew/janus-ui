/**
 * The submit half of the form engine (§12.1). Same registry + WeakMap
 * pattern as validators, plus the document-level `submit` listener that
 * owns the whole choreography: prevent default, validate, build `FormData`
 * with disabled-state filtering, dispatch to the handler, write back
 * results, reset.
 */

import { JS_ATTR } from '~/lib2/dom/config';
import { registerDocumentSetup } from '~/lib2/dom/document-setup';
import { setErrors, setFormError, touchAll, validateForm } from '~/lib2/dom/form/validate';
import { forceClose } from '~/lib2/dom/handlers/t-request-close';

export type SubmitResult =
	| { ok: true; reset?: boolean }
	| { ok: false; fieldErrors?: Record<string, string>; formError?: string };

export type SubmitHandler = (
	data: FormData,
	form: HTMLFormElement,
) => SubmitResult | Promise<SubmitResult>;

function tokens(el: Element): string[] {
	return (el.getAttribute(JS_ATTR) ?? '').split(/\s+/).filter(Boolean);
}

function isFieldDisabled(el: Element): boolean {
	return (
		el.getAttribute('aria-disabled') === 'true' ||
		('disabled' in el && (el as HTMLInputElement).disabled)
	);
}

// 1. Named submit handlers -- registered once at module load.
const namedSubmitHandlers = new Map<string, SubmitHandler>();

/** Register a submit handler by name, referenced from markup via `data-submit-handler="name"`. */
export function registerSubmitHandler(name: string, fn: SubmitHandler): void {
	namedSubmitHandlers.set(name, fn);
}

// 2. Inline closures -- keyed by form identity.
const elementSubmitHandlers = new WeakMap<HTMLFormElement, SubmitHandler>();

/** Attach a submit handler closure to a form. Returns a cleanup that detaches it. */
export function addSubmitHandler(form: HTMLFormElement, fn: SubmitHandler): () => void {
	elementSubmitHandlers.set(form, fn);
	return () => {
		if (elementSubmitHandlers.get(form) === fn) {
			elementSubmitHandlers.delete(form);
		}
	};
}

function resolveHandler(form: HTMLFormElement): SubmitHandler | undefined {
	const closure = elementSubmitHandlers.get(form);
	if (closure) {
		return closure;
	}
	const name = form.getAttribute('data-submit-handler');
	return name ? namedSubmitHandlers.get(name) : undefined;
}

/** Build `FormData`, excluding any field marked `aria-disabled="true"` (the `disabled`-equivalent for Janus controls, which never use the native attribute). */
function buildFormData(form: HTMLFormElement): FormData {
	const data = new FormData(form);
	for (const el of Array.from(form.elements)) {
		if (
			(el instanceof HTMLInputElement ||
				el instanceof HTMLSelectElement ||
				el instanceof HTMLTextAreaElement) &&
			el.name &&
			isFieldDisabled(el)
		) {
			data.delete(el.name);
		}
	}
	return data;
}

async function handleSubmit(ev: SubmitEvent): Promise<void> {
	const form = ev.target;
	if (!(form instanceof HTMLFormElement)) {
		return;
	}
	const formTokens = tokens(form);
	if (!formTokens.includes('t-submit')) {
		return;
	}
	ev.preventDefault();

	if (formTokens.includes('t-validate')) {
		touchAll(form);
		if (!validateForm(form)) {
			return;
		}
	}

	const handler = resolveHandler(form);
	if (!handler) {
		return;
	}

	const data = buildFormData(form);
	const result = await handler(data, form);

	if (result.ok) {
		if (formTokens.includes('t-close-on-success')) {
			const dialog = form.closest('dialog');
			if (dialog) {
				forceClose(dialog);
			}
		}
		if (result.reset !== false) {
			form.reset();
		}
	} else {
		if (result.fieldErrors) {
			setErrors(form, result.fieldErrors);
		}
		if (result.formError) {
			setFormError(form, result.formError);
		}
	}
}

registerDocumentSetup((doc) => {
	doc.addEventListener(
		'submit',
		(ev) => {
			void handleSubmit(ev);
		},
		{ capture: true },
	);
});

/** Clears the named-submit-handler registry. Test-only. */
export function _resetSubmitForTests(): void {
	namedSubmitHandlers.clear();
}
