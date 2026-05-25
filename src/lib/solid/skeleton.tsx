import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface SkeletonProps extends JSX.HTMLAttributes<HTMLDivElement> {
	width?: string;
	height?: string;
	circle?: boolean;
}

export function Skeleton(props: SkeletonProps) {
	const [local, rest] = splitProps(props, ['width', 'height', 'circle', 'class']);
	return (
		<div
			class={attrs('c-skeleton', local.circle && 'c-skeleton--circle', local.class)}
			style={{ width: local.width, height: local.height }}
			aria-hidden="true"
			{...rest}
		/>
	);
}
