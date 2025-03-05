import { focusOrScrollToError, setError, setErrorsByName } from '~/shared/handlers/validation';
import { createHandler } from '~/shared/utility/event-handler-attrs';
import { data, evt } from '~/shared/utility/magic-strings';
import { elmDoc } from '~/shared/utility/multi-view';

export interface FormSubmitResponse {
	/** Did the submission suceed or fail? */
	ok: boolean;
	/** Top-level message (can be success or error) */
	message?: string;
	/** Error messages on individual elements, keyed by name */
	fieldErrors?: Record<string, string>;
}

/** Same as form data but the names are typed */
export interface TypedFormData<TNames> {
	append(key: TNames, value: string | Blob): void;
	append(key: TNames, value: Blob, filename?: string): void;
	delete(key: TNames): void;
	get(key: TNames): FormDataEntryValue | null;
	getAll(key: TNames): FormDataEntryValue[];
	has(key: TNames): boolean;
	set(key: TNames, value: string | Blob): void;
	set(key: TNames, value: Blob, filename?: string): void;
}

export type TypedSubmitEvent<TNames> = SubmitEvent & { data: TypedFormData<TNames> };

/** Submit handler returning null or defined is deemed `{ ok: true }` */
export type SubmitHandler<TNames> = (
	event: TypedSubmitEvent<TNames>,
) => Promise<FormSubmitResponse | null | undefined>;

/** Additional options for form submit handlers */
export interface FormSubmitOptions {
	/** Clear on successful submit? */
	clearOnSuccess?: boolean | undefined;
}

/** Magic data attribute to note that form submission is in progress */
export const FORM_BUSY_ATTR = data('form__busy');

/**
 * Custom event that is fired when validation on submit is complete and successful
 * Prefer this event over submit for custom onSubmit behavior.
 */
export const VALID_SUBMIT_EVENT = evt('validate__submit-valid');

/**
 * Custom event that is fired when validation on submit is complete and unsuccessful.
 * Distinguish from `invalid` event in that invalid is fired on invididual elements
 * but this is fired on the form itself.
 */
export const INVALID_SUBMIT_EVENT = evt('validate__submit-invalid');

declare module '~/shared/utility/event-handler-attrs' {
	interface CustomEventDetails {
		[VALID_SUBMIT_EVENT]: null;
		[INVALID_SUBMIT_EVENT]: null;
	}
}

/** Handler to reset on successful (async) submit */
export const formResetOnSuccess = createHandler(
	VALID_SUBMIT_EVENT,
	'form__reset-on-success',
	(event) => {
		const form = event.target as HTMLFormElement;
		form.reset();
	},
);

export function createSubmitHandler<TNames>(
	onSubmit: SubmitHandler<TNames>,
	names: Record<string, TNames>,
) {
	return Object.assign(
		createHandler('submit', 'form__submit', async (event) => {
			event.preventDefault();

			const form = event.target as HTMLFormElement;
			form.setAttribute(FORM_BUSY_ATTR, '');

			// Also set busy attribute on buttons that may be outside the form but tied to it
			// (e.g. in a modal with a separate footer element)
			const formId = form.id;
			const submitButtons = form.id
				? elmDoc(form).querySelectorAll(`button[form="${formId}"]`)
				: [];
			for (const button of submitButtons) {
				button.setAttribute(FORM_BUSY_ATTR, '');
			}

			try {
				const response = await onSubmit(
					event as TypedSubmitEvent<TNames> & { delegateTarget: HTMLFormElement },
				);
				if (response?.ok === false) {
					if (response.fieldErrors) {
						setErrorsByName(form, response.fieldErrors);
					}
					if (response.message) {
						setError(form, response.message);
					}
					focusOrScrollToError(form);
					form.dispatchEvent(new CustomEvent(INVALID_SUBMIT_EVENT, { bubbles: true }));
					return;
				}
				form.dispatchEvent(new CustomEvent(VALID_SUBMIT_EVENT, { bubbles: true }));
			} finally {
				form.removeAttribute(FORM_BUSY_ATTR);
				for (const button of submitButtons) {
					button.removeAttribute(FORM_BUSY_ATTR);
				}
			}
		}),
		names,
	);
}
