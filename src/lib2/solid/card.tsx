/**
 * Card + structural subcomponents (§13.7) — `c-card o-box`.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { type Surface, surfaceClass } from '~/lib2/solid/variants';

export interface CardProps extends ComponentProps<'section'> {
	/** Maps to v-surface-*. */
	surface?: Surface | undefined;
}

export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['surface', 'class']);
	return (
		<section {...rest} class={cx('c-card o-box', surfaceClass(local.surface), local.class)} />
	);
}

export function CardHeader(props: ComponentProps<'header'>) {
	return <header {...props} />;
}

export function CardTitle(props: ComponentProps<'h3'>) {
	return <h3 {...props} />;
}

export function CardDescription(props: ComponentProps<'p'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <p {...rest} class={cx('o-caption', local.class)} />;
}

export function CardContent(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <div {...rest} class={cx('o-prose', local.class)} />;
}
