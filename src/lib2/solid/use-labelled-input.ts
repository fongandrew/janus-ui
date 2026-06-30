/**
 * `useLabelledInput` — the workhorse hook behind `LabelledInput` /
 * `LabelledInline` / `LabelledInputGroup` (§13.2). Returns flat prop
 * objects the consumer spreads onto the label, description, error, and
 * input elements. IDs are deterministic (`${id}-label`, `-desc`, `-err`)
 * for debuggability and stable hydration.
 */

import { type JSX } from 'solid-js';

import { attrs } from '~/lib2/solid/aria';

export interface UseLabelledInputOptions {
	/** The input's id. Required -- the hook never generates one (the wrapper owns ID generation, e.g. via `createUniqueId()`). */
	id: string;
	/** Whether a description block is rendered (drives `aria-describedby`). */
	description?: JSX.Element | undefined;
	required?: boolean | undefined;
	/** Whether the field is currently invalid (drives `aria-invalid`; independent of `errorMessage`'s presence). */
	invalid?: boolean | undefined;
	/**
	 * Accessor for SPA-controlled error text (§13.2.1). Presence is judged by
	 * the ACCESSOR being passed, not by what it currently returns -- passing
	 * `() => null` for "no error right now" still opts out of engine-written
	 * errors for this field.
	 */
	errorMessage?: (() => JSX.Element | null | undefined) | undefined;
}

export interface LabelledInputIds {
	input: string;
	label: string;
	desc: string;
	err: string;
}

export interface UseLabelledInputResult {
	ids: LabelledInputIds;
	labelProps: { id: string };
	descriptionProps: { id: string };
	errorProps: {
		id: string;
		'data-js': string;
		'data-form-error'?: undefined;
		'data-external-error'?: true;
	};
	inputProps: {
		id: string;
		'aria-labelledby': string;
		'aria-describedby': string | undefined;
		'aria-required': true | undefined;
		'aria-invalid': true | undefined;
	};
}

export function useLabelledInput(opts: UseLabelledInputOptions): UseLabelledInputResult {
	const ids: LabelledInputIds = {
		input: opts.id,
		label: `${opts.id}-label`,
		desc: `${opts.id}-desc`,
		err: `${opts.id}-err`,
	};

	const hasExternalError = opts.errorMessage !== undefined;

	return {
		ids,
		labelProps: { id: ids.label },
		descriptionProps: { id: ids.desc },
		errorProps: {
			id: ids.err,
			'data-js': 't-validate-error',
			...(hasExternalError ? { 'data-external-error': true as const } : {}),
		},
		inputProps: {
			id: ids.input,
			'aria-labelledby': ids.label,
			get 'aria-describedby'() {
				return attrs(opts.description ? ids.desc : undefined, ids.err);
			},
			get 'aria-required'() {
				return opts.required ? true : undefined;
			},
			get 'aria-invalid'() {
				const fromMessage = opts.errorMessage ? !!opts.errorMessage() : false;
				return opts.invalid || fromMessage ? true : undefined;
			},
		},
	};
}
