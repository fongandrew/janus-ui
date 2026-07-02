/**
 * Skeleton (§13.7) — `c-skeleton` placeholder block.
 */
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
			{...rest}
			class={cx('c-skeleton', local.circle && 'c-skeleton--circle', local.class)}
			style={{
				...(local.width ? { 'inline-size': local.width } : {}),
				...(local.height ? { 'block-size': local.height } : {}),
			}}
		/>
	);
}
