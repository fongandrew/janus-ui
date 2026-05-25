import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface RadioProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	disabled?: boolean;
}

export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<input
			type="radio"
			class={attrs('c-radio', local.class)}
			aria-disabled={local.disabled ? 'true' : undefined}
			{...rest}
		/>
	);
}

export interface RadioGroupProps extends JSX.HTMLAttributes<HTMLFieldSetElement> {
	label?: string;
}

export function RadioGroup(props: RadioGroupProps) {
	const [local, rest] = splitProps(props, ['class', 'label']);
	return (
		<fieldset
			class={local.class}
			role="radiogroup"
			data-js="t-roving-focus"
			aria-orientation="vertical"
			aria-label={local.label}
			{...rest}
		/>
	);
}
