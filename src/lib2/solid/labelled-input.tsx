/**
 * Thin opinionated layout components over `useLabelledInput` (§13.2).
 * `children` is a render-prop receiving `inputProps` -- no hidden context,
 * no per-input-type provider tree. Layering a consumer's own ARIA
 * contribution happens via an explicit `ca(p, ...)` merge at the call site.
 */

import { createUniqueId, type JSX } from 'solid-js';

import { useLabelledInput, type UseLabelledInputResult } from '~/lib2/solid/use-labelled-input';

export interface LabelledInputBaseProps {
	id?: string | undefined;
	label: JSX.Element;
	description?: JSX.Element | undefined;
	required?: boolean | undefined;
	invalid?: boolean | undefined;
	errorMessage?: (() => JSX.Element | null | undefined) | undefined;
}

export interface LabelledInputProps extends LabelledInputBaseProps {
	children: (inputProps: UseLabelledInputResult['inputProps']) => JSX.Element;
}

function ErrorSlot(props: {
	errorProps: UseLabelledInputResult['errorProps'];
	errorMessage?: (() => JSX.Element | null | undefined) | undefined;
}) {
	return (
		<span class="c-error-message" {...props.errorProps}>
			{props.errorMessage?.()}
		</span>
	);
}

/** A block-level labelled input: label above, optional description, the control, then the error slot. */
export function LabelledInput(props: LabelledInputProps): JSX.Element {
	// eslint-disable-next-line solid/reactivity -- id is captured once and stays stable
	const id = props.id ?? createUniqueId();
	const { labelProps, descriptionProps, errorProps, inputProps } = useLabelledInput({
		id,
		get description() {
			return props.description;
		},
		get required() {
			return props.required;
		},
		get invalid() {
			return props.invalid;
		},
		get errorMessage() {
			return props.errorMessage;
		},
	});

	return (
		<div class="o-stack o-stack--tight">
			<label class="c-label" {...labelProps}>
				{props.label}
				{props.required ? <span aria-hidden="true"> *</span> : null}
			</label>
			{props.description ? (
				<p class="o-caption" {...descriptionProps}>
					{props.description}
				</p>
			) : null}
			{props.children(inputProps)}
			<ErrorSlot errorProps={errorProps} errorMessage={props.errorMessage} />
		</div>
	);
}

/** A single-row labelled input: label and control side by side (settings-row style). */
export function LabelledInline(props: LabelledInputProps): JSX.Element {
	// eslint-disable-next-line solid/reactivity -- id is captured once and stays stable
	const id = props.id ?? createUniqueId();
	const { labelProps, descriptionProps, errorProps, inputProps } = useLabelledInput({
		id,
		get description() {
			return props.description;
		},
		get required() {
			return props.required;
		},
		get invalid() {
			return props.invalid;
		},
		get errorMessage() {
			return props.errorMessage;
		},
	});

	return (
		<div class="o-stack o-stack--tight">
			<div class="o-row">
				<label class="c-label" {...labelProps}>
					{props.label}
					{props.required ? <span aria-hidden="true"> *</span> : null}
				</label>
				{props.children(inputProps)}
			</div>
			{props.description ? (
				<p class="o-caption" {...descriptionProps}>
					{props.description}
				</p>
			) : null}
			<ErrorSlot errorProps={errorProps} errorMessage={props.errorMessage} />
		</div>
	);
}

export interface LabelledInputGroupProps extends LabelledInputBaseProps {
	/** Arbitrary group content (e.g. several `<Radio>`/`<Checkbox>` controls). No single input to bind a render-prop to -- see §13.2's "deep ARIA contribution is not supported" note. */
	children: JSX.Element;
}

/** A `<fieldset>` wrapping a group of controls that share one label/description/error (radio groups, checkbox groups). */
export function LabelledInputGroup(props: LabelledInputGroupProps): JSX.Element {
	// eslint-disable-next-line solid/reactivity -- id is captured once and stays stable
	const id = props.id ?? createUniqueId();
	const { descriptionProps, errorProps, inputProps } = useLabelledInput({
		id,
		get description() {
			return props.description;
		},
		get required() {
			return props.required;
		},
		get invalid() {
			return props.invalid;
		},
		get errorMessage() {
			return props.errorMessage;
		},
	});

	return (
		<fieldset class="o-stack o-stack--tight" {...inputProps}>
			<legend class="c-label">
				{props.label}
				{props.required ? <span aria-hidden="true"> *</span> : null}
			</legend>
			{props.description ? (
				<p class="o-caption" {...descriptionProps}>
					{props.description}
				</p>
			) : null}
			{props.children}
			<ErrorSlot errorProps={errorProps} errorMessage={props.errorMessage} />
		</fieldset>
	);
}
