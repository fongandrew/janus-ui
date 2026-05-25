import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
	surface?: 'card' | 'elevated' | 'sunken' | 'glass' | 'gradient';
}

export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['surface', 'class']);
	return (
		<div
			class={attrs('c-card o-box', local.surface && `v-surface-${local.surface}`, local.class)}
			{...rest}
		/>
	);
}

export function CardHeader(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ['class']);
	return <div class={attrs('c-card__header', local.class)} {...rest} />;
}

export function CardTitle(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
	const [local, rest] = splitProps(props, ['class']);
	return <h3 class={attrs('c-card__title', local.class)} {...rest} />;
}

export function CardDescription(props: JSX.HTMLAttributes<HTMLParagraphElement>) {
	const [local, rest] = splitProps(props, ['class']);
	return <p class={attrs('c-card__description', local.class)} {...rest} />;
}

export function CardContent(props: JSX.HTMLAttributes<HTMLDivElement>) {
	const [local, rest] = splitProps(props, ['class']);
	return <div class={attrs('c-card__content', local.class)} {...rest} />;
}
