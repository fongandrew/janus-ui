import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
	variant?: 'primary' | 'danger' | 'success' | 'warn' | 'info';
	dot?: boolean;
}

export function Badge(props: BadgeProps) {
	const [local, rest] = splitProps(props, ['variant', 'dot', 'class']);
	return (
		<span
			class={attrs('c-badge', local.variant && `v-colors-${local.variant}`, local.dot && 'c-badge--dot', local.class)}
			{...rest}
		/>
	);
}
