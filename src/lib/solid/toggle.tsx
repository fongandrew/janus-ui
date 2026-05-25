import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface ToggleProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	disabled?: boolean;
}

export function Toggle(props: ToggleProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<input
			type="checkbox"
			role="switch"
			class={attrs('c-toggle', local.class)}
			aria-disabled={local.disabled ? 'true' : undefined}
			{...rest}
		/>
	);
}
