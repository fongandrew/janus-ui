import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface SelectNativeProps extends JSX.SelectHTMLAttributes<HTMLSelectElement> {
	disabled?: boolean;
}

export function SelectNative(props: SelectNativeProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<select
			class={attrs('c-select-native o-input-box', local.class)}
			aria-disabled={local.disabled ? 'true' : undefined}
			{...rest}
		/>
	);
}
