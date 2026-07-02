import { createUniqueId } from 'solid-js';

import { ariaize, attrs } from '~/lib2/solid/aria';

/**
 * useLabelledInput (§13.2) — the labelling workhorse. Returns flat prop objects
 * the consumer spreads. IDs are deterministic (`${id}-label`, `-desc`, `-err`)
 * for debuggability and stable hydration.
 */
export interface LabelledInputOptions {
	id?: string;
	/** Whether a description element is rendered (controls aria-describedby). */
	description?: boolean;
	required?: boolean;
	invalid?: boolean;
	/**
	 * When present (even null), the consumer controls the error slot end-to-end;
	 * a `data-external-error` marker tells the engine to stay out of the slot
	 * (§13.2.1).
	 */
	errorMessage?: string | null | undefined;
}

export function useLabelledInput(opts: LabelledInputOptions = {}) {
	const id = opts.id ?? createUniqueId();
	const labelId = `${id}-label`;
	const descId = `${id}-desc`;
	const errId = `${id}-err`;
	const controlled = opts.errorMessage !== undefined;

	const describedBy = attrs(opts.description ? descId : undefined, errId);

	const inputProps = {
		id,
		'aria-labelledby': labelId,
		...(describedBy ? { 'aria-describedby': describedBy } : {}),
		...ariaize({ required: opts.required, invalid: opts.invalid }),
	};

	return {
		ids: { id, labelId, descId, errId },
		labelProps: { id: labelId, for: id },
		descriptionProps: { id: descId },
		errorProps: {
			id: errId,
			'data-js': 't-validate-error',
			...(controlled ? { 'data-external-error': true } : {}),
		},
		inputProps,
	};
}
