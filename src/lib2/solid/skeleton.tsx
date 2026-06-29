/**
 * `Skeleton` (§13.7). A CSS-animated content placeholder.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export interface SkeletonProps extends ComponentProps<'div'> {
	width?: string;
	height?: string;
	circle?: boolean;
	/** Text-line skeleton (matches line height). */
	text?: boolean;
}

export function Skeleton(props: SkeletonProps) {
	const [local, rest] = splitProps(props, [
		'width',
		'height',
		'circle',
		'text',
		'class',
		'style',
	]);
	return (
		<div
			{...rest}
			class={cx(
				'c-skeleton',
				local.circle && 'c-skeleton--circle',
				local.text && 'c-skeleton--text',
				local.class,
			)}
			style={{
				...(typeof local.style === 'object' ? local.style : {}),
				...(local.width ? { 'inline-size': local.width } : {}),
				...(local.height ? { 'block-size': local.height } : {}),
			}}
		/>
	);
}
