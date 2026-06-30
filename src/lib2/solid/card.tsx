/** `Card` family (§13.7) — thin structural wrappers over `c-card`. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { surfaceClass, type SurfaceVariant } from '~/lib2/solid/variant';

export interface CardProps extends ComponentProps<'div'> {
	surface?: SurfaceVariant | undefined;
}

export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['surface', 'class']);
	return <div {...rest} class={cx('c-card', surfaceClass(local.surface), local.class)} />;
}

export function CardHeader(props: ComponentProps<'header'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <header {...rest} class={cx('c-card__header', local.class)} />;
}

export function CardTitle(props: ComponentProps<'h2'>) {
	return <h2 {...props} />;
}

export function CardDescription(props: ComponentProps<'p'>) {
	return <p {...props} />;
}

export function CardContent(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <div {...rest} class={cx('c-card__content', local.class)} />;
}

export function CardFooter(props: ComponentProps<'footer'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <footer {...rest} class={cx('c-card__footer', local.class)} />;
}
