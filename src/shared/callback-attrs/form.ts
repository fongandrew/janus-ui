import {
	focusOrScrollToError,
	setError,
	setErrorsByName,
} from '~/shared/callback-attrs/validation';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { getDefaultLogger } from '~/shared/utility/logger';
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

export type TypedSubmitEvent<TNames> = SubmitEvent & {
	data: TypedFormData<TNames>;
	currentTarget: HTMLFormElement;
};

/** Submit handler returning null or defined is deemed `{ ok: true }` */
export type SubmitHandler<TNames, TExtra extends (string | undefined)[]> = (
	this: HTMLFormElement,
	event: TypedSubmitEvent<TNames>,
	...extra: TExtra
) =>
	| Promise<FormSubmitResponse | null | undefined | void>
	| FormSubmitResponse
	| null
	| undefined
	| void;

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

declare module '~/shared/utility/callback-attrs/events' {
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

export function createSubmitHandler<TNames, TExtra extends (string | undefined)[]>(
	handlerName: string,
	onSubmit: SubmitHandler<TNames, TExtra>,
	names: Record<string, TNames>,
) {
	return Object.assign(
		createHandler('submit', handlerName, async function (event, ...extra: TExtra) {
			event.preventDefault();

			const form = event.target as HTMLFormElement;
			form.setAttribute(FORM_BUSY_ATTR, '');

			// Set attribute + aria-disabled on all submit and reset buttons within the form.
			// Also set busy attribute on buttons that may be outside the form but tied to it
			// (e.g. in a modal with a separate footer element)
			const formId = form.id;
			const formButtons = form.id
				? elmDoc(form).querySelectorAll(
						`[form="${formId}"],[id="${formId}"] [type="submit"],[id="${formId}"] [type="reset"]`,
					)
				: form.querySelectorAll('[type="submit"],[type="reset"]');
			for (const button of formButtons) {
				if (button.ariaDisabled === 'true') continue;
				button.setAttribute(FORM_BUSY_ATTR, '');
				button.setAttribute('aria-disabled', 'true');
			}

			try {
				const eventWithData = Object.assign(event, {
					data: new FormData(form) as TypedFormData<TNames>,
				}) as TypedSubmitEvent<TNames>;
				const response = await onSubmit.call(form, eventWithData, ...extra);
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
			} catch (err) {
				getDefaultLogger().error(err);
				setError(form, (err as Error)?.message ?? String(err));
				focusOrScrollToError(form);
				form.dispatchEvent(new CustomEvent(INVALID_SUBMIT_EVENT, { bubbles: true }));
			} finally {
				form.removeAttribute(FORM_BUSY_ATTR);
				for (const button of formButtons) {
					if (!button.hasAttribute(FORM_BUSY_ATTR)) continue;
					button.removeAttribute(FORM_BUSY_ATTR);
					button.ariaDisabled = 'false';
				}
			}
		}),
		{ names },
	);
}
