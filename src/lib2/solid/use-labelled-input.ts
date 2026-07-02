/**
 * useLabelledInput — the labelling workhorse (§13.2). Takes label-related
 * options, returns flat prop objects the consumer spreads. IDs are
 * deterministic (`${inputId}-label`, `-desc`, `-err`) for debuggability and
 * stable hydration.
 */
import { createUniqueId, type JSX } from 'solid-js';

import { attrs } from '~/lib2/solid/aria';

export interface UseLabelledInputOptions {
	/** Input id; generated via createUniqueId() when omitted. */
	id?: string | undefined;
	label?: JSX.Element;
	description?: JSX.Element;
	required?: boolean | undefined;
	invalid?: boolean | undefined;
	/**
	 * Prop-controlled error text (§13.2.1). When !== undefined (even null
	 * for "no error"), the consumer owns the error slot end-to-end and the
	 * engine's dispatcher skips writes (via the data-external-error marker).
	 */
	errorMessage?: string | null | undefined;
}

export interface LabelledInputIds {
	input: string;
	label: string;
	description: string;
	error: string;
}

export interface LabelledInputRenderProps {
	id: string;
	'aria-labelledby': string;
	'aria-describedby': string;
	readonly 'aria-required': 'true' | undefined;
	readonly 'aria-invalid': 'true' | undefined;
}

export interface UseLabelledInput {
	ids: LabelledInputIds;
	labelProps: { id: string; for: string };
	descriptionProps: { id: string };
	errorProps: {
		id: string;
		'data-js': string;
		readonly 'data-external-error': '' | undefined;
	};
	inputProps: LabelledInputRenderProps;
}

export function useLabelledInput(options: UseLabelledInputOptions = {}): UseLabelledInput {
	const inputId = options.id ?? createUniqueId();
	const ids: LabelledInputIds = {
		input: inputId,
		label: `${inputId}-label`,
		description: `${inputId}-desc`,
		error: `${inputId}-err`,
	};

	return {
		ids,
		labelProps: { id: ids.label, for: ids.input },
		descriptionProps: { id: ids.description },
		errorProps: {
			id: ids.error,
			'data-js': 't-validate-error',
			// Present iff errorMessage is prop-controlled — the engine skips
			// writes to elements carrying this marker (§13.2.1).
			get 'data-external-error'() {
				return options.errorMessage !== undefined ? ('' as const) : undefined;
			},
		},
		inputProps: {
			id: ids.input,
			'aria-labelledby': ids.label,
			// The error slot is always rendered by the layouts (the engine
			// writes into it); the description only when provided.
			get 'aria-describedby'() {
				return attrs(options.description !== undefined && ids.description, ids.error)!;
			},
			get 'aria-required'() {
				return options.required ? ('true' as const) : undefined;
			},
			get 'aria-invalid'() {
				return options.invalid || options.errorMessage != null
					? ('true' as const)
					: undefined;
			},
		},
	};
}
