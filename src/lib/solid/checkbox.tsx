import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface CheckboxProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	disabled?: boolean;
}

export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<input
			type="checkbox"
			class={attrs('c-checkbox', local.class)}
			aria-disabled={local.disabled ? 'true' : undefined}
			{...rest}
		/>
	);
}
