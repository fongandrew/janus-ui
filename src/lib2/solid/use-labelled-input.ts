/**
 * `useLabelledInput` — the labelling workhorse (§13.2).
 *
 * Takes label-related options and returns flat prop objects the consumer spreads.
 * IDs are deterministic — `${inputId}-label`, `-desc`, `-err` — for debuggability
 * and stable hydration. `inputProps` carries `id`, `aria-labelledby`,
 * `aria-describedby` (joining description / error IDs only when each is rendered),
 * `aria-required`, and `aria-invalid`.
 */
import { createUniqueId } from 'solid-js';

import { attrs } from '~/lib2/solid/aria';

export interface UseLabelledInputOptions {
	/** Explicit input id; auto-generated when omitted. */
	id?: string | undefined;
	/** Whether a description element is rendered (adds its id to aria-describedby). */
	hasDescription?: boolean | undefined;
	/** Whether the field is required. */
	required?: boolean | undefined;
	/** Whether the field is currently invalid. */
	invalid?: boolean | undefined;
	/**
	 * Present (even `null`) ⇒ the error slot is consumer-controlled: a
	 * `data-external-error` marker is added so the engine stays out of the slot.
	 */
	hasErrorMessage?: boolean | undefined;
}

export interface LabelledInputIds {
	input: string;
	label: string;
	description: string;
	error: string;
}

export interface UseLabelledInputResult {
	ids: LabelledInputIds;
	labelProps: { id: string; for: string };
	descriptionProps: { id: string };
	errorProps: {
		id: string;
		'data-js': string;
		'data-external-error'?: '';
	};
	inputProps: {
		id: string;
		'aria-labelledby': string;
		'aria-describedby'?: string;
		'aria-required'?: true;
		'aria-invalid'?: true;
	};
}

export function useLabelledInput(opts: UseLabelledInputOptions = {}): UseLabelledInputResult {
	const inputId = opts.id ?? createUniqueId();
	const ids: LabelledInputIds = {
		input: inputId,
		label: `${inputId}-label`,
		description: `${inputId}-desc`,
		error: `${inputId}-err`,
	};

	const describedBy = attrs(opts.hasDescription ? ids.description : undefined, ids.error);

	return {
		ids,
		labelProps: { id: ids.label, for: ids.input },
		descriptionProps: { id: ids.description },
		errorProps: {
			id: ids.error,
			'data-js': 't-validate-error',
			...(opts.hasErrorMessage ? { 'data-external-error': '' as const } : {}),
		},
		inputProps: {
			id: ids.input,
			'aria-labelledby': ids.label,
			...(describedBy ? { 'aria-describedby': describedBy } : {}),
			...(opts.required ? { 'aria-required': true as const } : {}),
			...(opts.invalid ? { 'aria-invalid': true as const } : {}),
		},
	};
}
