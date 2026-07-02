import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface SkeletonProps extends ComponentProps<'div'> {
	width?: string;
	height?: string;
	/** Circular placeholder (adds the `c-skeleton--circle` variant). */
	circle?: boolean;
}

/** Skeleton (§10.1) — `c-skeleton` loading placeholder sized inline. */
export function Skeleton(props: SkeletonProps) {
	const [local, rest] = splitProps(props, ['width', 'height', 'circle', 'class', 'style']);
	const style = (): JSX.CSSProperties => ({
		...(local.width ? { 'inline-size': local.width } : {}),
		...(local.height ? { 'block-size': local.height } : {}),
		...(local.style && typeof local.style === 'object' ? local.style : {}),
	});
	return (
		<div
			{...rest}
			aria-hidden="true"
			class={cx('c-skeleton', local.circle && 'c-skeleton--circle', local.class)}
			style={style()}
		/>
	);
}
