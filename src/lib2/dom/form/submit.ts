/**
 * Form submission engine (§12.1).
 *
 * Same registry + WeakMap pattern as validators. The submit dispatcher owns all
 * choreography: preventDefault, run validation, build FormData (excluding
 * aria-disabled fields), dispatch to the handler, feed back errors, reset on success.
 */
import { jsAttr } from '~/lib2/dom/config';
import {
	focusFirstError,
	isShowingError,
	isTouched,
	resetValidation,
	setErrors,
	setFormError,
	touchAll,
	validateField,
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

const VALIDATE_TOKEN = 't-validate';
const SUBMIT_TOKEN = 't-submit';
const SUBMIT_HANDLER_ATTR = 'data-submit-handler';

/** Register a named submit handler once at module load. */
export function registerSubmitHandler(name: string, fn: SubmitHandler): void {
	namedHandlers.set(name, fn);
}

/** Attach a closure submit handler to a form (WeakMap). Returns cleanup. */
export function addSubmitHandler(form: HTMLFormElement, fn: SubmitHandler): () => void {
	inlineHandlers.set(form, fn);
	return () => {
		if (inlineHandlers.get(form) === fn) inlineHandlers.delete(form);
	};
}

function hasToken(el: Element, token: string): boolean {
	return el.getAttribute(jsAttr())?.split(/\s+/).includes(token) ?? false;
}

function resolveHandler(form: HTMLFormElement): SubmitHandler | undefined {
	const inline = inlineHandlers.get(form);
	if (inline) return inline;
	const name = form.getAttribute(SUBMIT_HANDLER_ATTR);
	return name ? namedHandlers.get(name) : undefined;
}

/**
 * Build FormData excluding aria-disabled controls — same outcome as the native
 * `disabled` attribute, but without dropping the field from tab order / a11y tree.
 */
function buildFormData(form: HTMLFormElement): FormData {
	const data = new FormData(form);
	for (const el of form.querySelectorAll<HTMLInputElement>('[aria-disabled="true"][name]')) {
		data.delete(el.name);
	}
	return data;
}

const VALIDATE_GROUP_TOKEN = 't-validate-group';
const RESET_ON_CLOSE_TOKEN = 't-reset-on-close';
const CLOSE_ON_SUCCESS_TOKEN = 't-close-on-success';

/** Close the nearest ancestor `<dialog>` / `[popover]` of a form. */
function closeAncestorOverlay(form: HTMLElement): void {
	const dialog = form.closest<HTMLDialogElement>('dialog[open]');
	if (dialog) {
		dialog.close();
		return;
	}
	const popover = form.closest<HTMLElement>('[popover]');
	popover?.hidePopover?.();
}

/** When a child of a `t-validate-group` changes, re-validate every *other touched* child. */
function revalidateGroup(target: HTMLElement): void {
	const group = target.closest<HTMLElement>(`[${jsAttrEscaped()}~="${VALIDATE_GROUP_TOKEN}"]`);
	if (!group) return;
	for (const el of group.querySelectorAll<HTMLElement>(
		'input, textarea, select, [data-validators]',
	)) {
		if (el !== target && isTouched(el)) validateField(el);
	}
}

/** The configured opt-in attribute, escaped for a CSS attribute selector. */
function jsAttrEscaped(): string {
	return CSS.escape(jsAttr());
}

let installed = false;

/** Install the form engine's own capture-phase listeners. Idempotent. */
export function installFormEngine(): void {
	if (installed || typeof document === 'undefined') return;
	installed = true;

	// Touch + validate a field on change.
	document.addEventListener(
		'change',
		(ev) => {
			const target = ev.target;
			if (!(target instanceof HTMLElement)) return;
			const form = target.closest<HTMLFormElement>('form');
			if (form && hasToken(form, VALIDATE_TOKEN)) {
				validateField(target);
				revalidateGroup(target);
			}
		},
		true,
	);

	// Live feedback: once a field is already showing an error, revalidate on input.
	document.addEventListener(
		'input',
		(ev) => {
			const target = ev.target;
			if (!(target instanceof HTMLElement)) return;
			if (!isTouched(target) && !isShowingError(target)) return;
			const form = target.closest<HTMLFormElement>('form');
			if (form && hasToken(form, VALIDATE_TOKEN)) validateField(target);
		},
		true,
	);

	document.addEventListener('submit', onSubmit, true);

	// t-reset-on-close: reset forms inside a dialog that just closed.
	document.addEventListener(
		'close',
		(ev) => {
			const dialog = ev.target;
			if (!(dialog instanceof HTMLElement)) return;
			for (const form of dialog.querySelectorAll<HTMLFormElement>('form')) {
				if (hasToken(form, RESET_ON_CLOSE_TOKEN)) {
					form.reset();
					resetValidation(form);
				}
			}
		},
		true,
	);

	// t-reset-on-close for popovers: react to the closed toggle.
	document.addEventListener(
		'toggle',
		(ev) => {
			const popover = ev.target;
			if (!(popover instanceof HTMLElement)) return;
			if ((ev as ToggleEvent).newState !== 'closed') return;
			for (const form of popover.querySelectorAll<HTMLFormElement>('form')) {
				if (hasToken(form, RESET_ON_CLOSE_TOKEN)) {
					form.reset();
					resetValidation(form);
				}
			}
		},
		true,
	);
}

async function onSubmit(ev: Event): Promise<void> {
	const form = ev.target;
	if (!(form instanceof HTMLFormElement)) return;

	const wantsValidate = hasToken(form, VALIDATE_TOKEN);
	const wantsSubmit = hasToken(form, SUBMIT_TOKEN);
	if (!wantsValidate && !wantsSubmit) return;

	if (wantsValidate) {
		touchAll(form);
		if (validateForm(form)) {
			ev.preventDefault();
			ev.stopPropagation();
			focusFirstError(form);
			return;
		}
	}

	if (!wantsSubmit) return;
	const handler = resolveHandler(form);
	if (!handler) return;

	ev.preventDefault();
	const result = await handler(buildFormData(form), form);

	if (result.ok) {
		if (result.reset !== false) {
			form.reset();
			resetValidation(form);
		}
		form.dispatchEvent(new CustomEvent('janus:submitsuccess', { bubbles: true }));
		if (hasToken(form, CLOSE_ON_SUCCESS_TOKEN)) closeAncestorOverlay(form);
	} else {
		if (result.fieldErrors) setErrors(form, result.fieldErrors);
		if (result.formError) setFormError(form, result.formError);
		focusFirstError(form);
	}
}
