import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface SpinnerProps extends JSX.HTMLAttributes<HTMLSpanElement> {
	size?: string;
}

export function Spinner(props: SpinnerProps) {
	const [local, rest] = splitProps(props, ['class', 'size']);
	return (
		<span
			class={attrs('c-spinner o-square', local.class)}
			style={local.size ? { '--v-input-height': local.size } : undefined}
			aria-label="Loading"
			role="status"
			{...rest}
		/>
	);
}
