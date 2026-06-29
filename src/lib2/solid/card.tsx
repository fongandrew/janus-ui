/**
 * `Card` family (§13.7). Surface chrome over `o-box`. Subcomponents are thin
 * structural wrappers (header / title / description / content).
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export type CardSurface = 'card' | 'elevated' | 'sunken' | 'glass' | 'gradient';

export interface CardProps extends ComponentProps<'article'> {
	surface?: CardSurface;
}

export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['surface', 'class']);
	return (
		<article
			{...rest}
			class={cx('c-card o-box', local.surface && `v-surface-${local.surface}`, local.class)}
		/>
	);
}

export function CardHeader(props: ComponentProps<'header'>) {
	return <header {...props} class={cx('o-stack', props.class)} />;
}

export function CardTitle(props: ComponentProps<'h3'>) {
	return <h3 {...props} />;
}

export function CardDescription(props: ComponentProps<'p'>) {
	return <p {...props} class={cx('o-caption v-colors-secondary', props.class)} />;
}

export function CardContent(props: ComponentProps<'div'>) {
	return <div {...props} class={cx('o-stack', props.class)} />;
}
