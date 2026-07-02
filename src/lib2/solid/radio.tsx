import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface RadioProps extends Omit<ComponentProps<'input'>, 'disabled' | 'type'> {
	/** Rendered as `aria-disabled` (§13.1). */
	disabled?: boolean;
	/** Optional inline label; when present the input is wrapped in a `<label>`. */
	label?: JSX.Element;
}

/** Radio (§10.1) — `c-radio` input, optionally wrapped in a `<label>`. */
export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['class', 'disabled', 'label']);

	const input = (
		<input
			{...rest}
			type="radio"
			{...ariaize({ disabled: local.disabled ?? false })}
			class={cx('c-radio', local.class)}
		/>
	);

	return (
		<Show when={local.label !== undefined} fallback={input}>
			<label class="o-row">
				{input}
				<span>{local.label}</span>
			</label>
		</Show>
	);
}

export interface RadioGroupProps extends ComponentProps<'fieldset'> {
	legend?: JSX.Element;
}

/** RadioGroup (§10.1) — `<fieldset role="radiogroup">` with roving focus. */
export function RadioGroup(props: RadioGroupProps) {
	const [local, rest] = splitProps(props, ['legend', 'class', 'children']);
	return (
		<fieldset
			{...rest}
			role="radiogroup"
			data-js="t-roving-focus"
			class={cx('o-stack', local.class)}
		>
			{local.legend !== undefined ? <legend>{local.legend}</legend> : null}
			{local.children}
		</fieldset>
	);
}
