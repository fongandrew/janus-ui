/**
 * Thin opinionated layouts over useLabelledInput (§13.2). `children` is a
 * render-prop receiving the input props to spread — wrapper-to-leaf wiring
 * with no context magic. Merge your own ARIA contribution at the call site
 * with `ca(p, { 'aria-describedby': concat(...) })`.
 */
import cx from 'classix';
import { type JSX, Show } from 'solid-js';

import {
	type LabelledInputRenderProps,
	useLabelledInput,
	type UseLabelledInputOptions,
} from '~/lib2/solid/use-labelled-input';

export interface LabelledInputProps extends UseLabelledInputOptions {
	label: JSX.Element;
	children: (inputProps: LabelledInputRenderProps) => JSX.Element;
	class?: string | undefined;
}

/** Stacked layout: label above, control, description + error slot below. */
export function LabelledInput(props: LabelledInputProps) {
	const { labelProps, descriptionProps, errorProps, inputProps } = useLabelledInput(props);
	return (
		<div class={cx('o-stack', props.class)} style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}>
			<label {...labelProps}>{props.label}</label>
			{props.children(inputProps)}
			<Show when={props.description !== undefined}>
				<p {...descriptionProps} class="o-caption">
					{props.description}
				</p>
			</Show>
			<span {...errorProps} class="c-error-message o-caption">
				{props.errorMessage}
			</span>
		</div>
	);
}

/** Inline layout: label wraps control + text in an o-row (checkbox, toggle). */
export function LabelledInline(props: LabelledInputProps) {
	const { ids, errorProps, inputProps } = useLabelledInput(props);
	return (
		<div class={cx('o-stack', props.class)} style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}>
			<label class="o-row" for={ids.input}>
				{props.children(inputProps)}
				<span id={ids.label}>{props.label}</span>
			</label>
			<Show when={props.description !== undefined}>
				<p id={ids.description} class="o-caption">
					{props.description}
				</p>
			</Show>
			<span {...errorProps} class="c-error-message o-caption">
				{props.errorMessage}
			</span>
		</div>
	);
}

/**
 * Group layout: a labelled role="group" wrapper for multi-control rows
 * (radio sets, split inputs). The render-prop receives the shared ARIA
 * props to spread onto the group's control container.
 */
export function LabelledInputGroup(props: LabelledInputProps) {
	const { ids, descriptionProps, errorProps, inputProps } = useLabelledInput(props);
	return (
		<div
			role="group"
			aria-labelledby={ids.label}
			class={cx('o-stack', props.class)}
			style={{ '--o-stack__gap': 'var(--v-gap-tight)' }}
		>
			<span id={ids.label}>{props.label}</span>
			{props.children(inputProps)}
			<Show when={props.description !== undefined}>
				<p {...descriptionProps} class="o-caption">
					{props.description}
				</p>
			</Show>
			<span {...errorProps} class="c-error-message o-caption">
				{props.errorMessage}
			</span>
		</div>
	);
}
