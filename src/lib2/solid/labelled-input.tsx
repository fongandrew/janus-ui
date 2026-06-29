/**
 * Labelling layout components (§13.2) — thin opinionated arrangements over
 * {@link useLabelledInput}. Their `children` is a render-prop receiving `inputProps`.
 *
 * ```tsx
 * <LabelledInput label="Email" description="Used for login">
 *   {(p) => <Input {...p} type="email" name="email" />}
 * </LabelledInput>
 * ```
 */
import cx from 'classix';
import { type JSX, Show } from 'solid-js';

import { useLabelledInput, type UseLabelledInputResult } from '~/lib2/solid/use-labelled-input';

export type LabelledInputChildren = (
	inputProps: UseLabelledInputResult['inputProps'],
) => JSX.Element;

export interface LabelledInputProps {
	label: JSX.Element;
	description?: JSX.Element;
	/** Present (even `null`) ⇒ the error slot is consumer-controlled (§13.2.1). */
	errorMessage?: JSX.Element;
	id?: string;
	required?: boolean;
	invalid?: boolean;
	class?: string;
	children: LabelledInputChildren;
}

function fields(props: LabelledInputProps): UseLabelledInputResult {
	/* eslint-disable solid/reactivity -- IDs and label structure are resolved once at
	   creation; these label props are not expected to change reactively. */
	return useLabelledInput({
		id: props.id,
		hasDescription: props.description != null,
		required: props.required,
		invalid: props.invalid,
		hasErrorMessage: 'errorMessage' in props,
	});
	/* eslint-enable solid/reactivity */
}

/** A stacked label / description / control / error arrangement. */
export function LabelledInput(props: LabelledInputProps) {
	const f = fields(props);
	return (
		<div class={cx('o-stack', props.class)}>
			<label {...f.labelProps}>{props.label}</label>
			<Show when={props.description != null}>
				<span {...f.descriptionProps} class="o-caption v-colors-secondary">
					{props.description}
				</span>
			</Show>
			{props.children(f.inputProps)}
			<span {...f.errorProps} class="c-error-message">
				{props.errorMessage}
			</span>
		</div>
	);
}

/** An inline label arrangement (control + label on one row), for checkboxes / toggles. */
export function LabelledInline(props: LabelledInputProps) {
	const f = fields(props);
	return (
		<div class={cx('o-stack', props.class)}>
			<label {...f.labelProps} class="o-row">
				{props.children(f.inputProps)}
				<span>{props.label}</span>
			</label>
			<Show when={props.description != null}>
				<span {...f.descriptionProps} class="o-caption v-colors-secondary">
					{props.description}
				</span>
			</Show>
			<span {...f.errorProps} class="c-error-message">
				{props.errorMessage}
			</span>
		</div>
	);
}

export interface LabelledInputGroupProps {
	label: JSX.Element;
	description?: JSX.Element;
	class?: string;
	children: JSX.Element;
}

/** A `<fieldset>` group with a `<legend>` label — for radio groups and field clusters. */
export function LabelledInputGroup(props: LabelledInputGroupProps) {
	return (
		<fieldset class={cx('o-stack', props.class)}>
			<legend>{props.label}</legend>
			<Show when={props.description != null}>
				<span class="o-caption v-colors-secondary">{props.description}</span>
			</Show>
			{props.children}
		</fieldset>
	);
}
