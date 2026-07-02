import cx from 'classix';
import { type JSX } from 'solid-js';

import { useLabelledInput } from '~/lib2/solid/use-labelled-input';

/**
 * Thin, opinionated layout components over useLabelledInput (§13.2). The
 * `children` prop is a render-prop receiving the input props to spread.
 */

export interface LabelledInputProps {
	label: JSX.Element;
	description?: JSX.Element;
	required?: boolean;
	invalid?: boolean;
	/** Present (even null) → consumer controls the error slot (§13.2.1). */
	errorMessage?: string | null;
	id?: string;
	class?: string;
	children: (inputProps: Record<string, unknown>) => JSX.Element;
}

function useFieldParts(props: LabelledInputProps) {
	return useLabelledInput({
		id: props.id,
		description: props.description !== undefined,
		required: props.required,
		invalid: props.invalid,
		...(props.errorMessage !== undefined ? { errorMessage: props.errorMessage } : {}),
	});
}

export function LabelledInput(props: LabelledInputProps) {
	const l = useFieldParts(props);
	return (
		<div class={cx('o-stack o-field', props.class)} style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}>
			<label {...l.labelProps}>{props.label}</label>
			{props.description !== undefined ? (
				<p {...l.descriptionProps} class="c-description">
					{props.description}
				</p>
			) : null}
			{props.children(l.inputProps)}
			<span {...l.errorProps} class="c-error-message">
				{props.errorMessage ?? ''}
			</span>
		</div>
	);
}

/** Label beside the control (checkbox / toggle / radio row). */
export function LabelledInline(props: LabelledInputProps) {
	const l = useFieldParts(props);
	return (
		<div class={cx('o-field', props.class)}>
			<label class="o-row" {...l.labelProps}>
				{props.children(l.inputProps)}
				<span>{props.label}</span>
			</label>
			<span {...l.errorProps} class="c-error-message">
				{props.errorMessage ?? ''}
			</span>
		</div>
	);
}

export interface LabelledInputGroupProps {
	legend: JSX.Element;
	description?: JSX.Element;
	class?: string;
	children: JSX.Element;
}

/** Grouping wrapper (fieldset) for related controls. */
export function LabelledInputGroup(props: LabelledInputGroupProps) {
	return (
		<fieldset class={cx('o-stack o-field', props.class)}>
			<legend>{props.legend}</legend>
			{props.description !== undefined ? <p class="c-description">{props.description}</p> : null}
			{props.children}
		</fieldset>
	);
}
