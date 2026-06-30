/** `Skeleton` (§13.7) — `c-skeleton`, a shimmering loading placeholder. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export interface SkeletonProps extends ComponentProps<'div'> {
	width?: string | undefined;
	height?: string | undefined;
	circle?: boolean | undefined;
}

export function Skeleton(props: SkeletonProps) {
	const [local, rest] = splitProps(props, ['width', 'height', 'circle', 'class']);
	return (
		<div
			aria-hidden="true"
			{...rest}
			class={cx('c-skeleton', local.circle && 'c-skeleton--circle', local.class)}
			style={{ 'inline-size': local.width, 'block-size': local.height }}
		/>
	);
}
