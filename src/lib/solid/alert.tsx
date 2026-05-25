import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface AlertProps extends JSX.HTMLAttributes<HTMLDivElement> {
	variant?: 'success' | 'danger' | 'warn' | 'info';
}

export function Alert(props: AlertProps) {
	const [local, rest] = splitProps(props, ['variant', 'class', 'role']);
	return (
		<div
			class={attrs('c-alert', local.variant && `v-colors-${local.variant}`, local.class)}
			role={local.role ?? 'alert'}
			{...rest}
		/>
	);
}
