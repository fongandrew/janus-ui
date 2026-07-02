/**
 * Radio / RadioGroup (§13.7) — `c-radio` inputs inside a
 * `<fieldset role="radiogroup" data-js="t-roving-focus">`.
 */
import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

import { ariaize, attrs } from '~/lib2/solid/aria';

export interface RadioGroupProps extends ComponentProps<'fieldset'> {
	'data-js'?: string | undefined;
}

export function RadioGroup(props: RadioGroupProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class', 'data-js']);
	return (
		<fieldset
			{...rest}
			role="radiogroup"
			aria-orientation="horizontal"
			data-js={attrs('t-roving-focus', local['data-js'])}
			class={cx(local.class)}
			{...ariaize({ disabled: local.disabled })}
		/>
	);
}

export interface RadioProps extends ComponentProps<'input'> {
	/** Optional inline label text; renders a wrapping <label class="o-row">. */
	label?: JSX.Element;
}

export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['label', 'disabled', 'class']);
	const input = (
		<input
			type="radio"
			{...rest}
			class={cx('c-radio', local.class)}
			{...ariaize({ disabled: local.disabled })}
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
