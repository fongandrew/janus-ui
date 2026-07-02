import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

/**
 * Render-only Card wrappers (Phase 0).
 *
 * These apply the documented v2 class list and spread props — nothing else.
 * No behavior, no `data-js`, no finished prop API; those arrive in Phase 6.
 * The point at this stage is to exercise the §4.1 contract: "the JSX component
 * applies the right classes" (`Card` -> `c-card o-box`).
 */

export type CardProps = ComponentProps<'section'> & {
	as?: 'article' | 'div' | 'section' | undefined;
};

export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['as', 'class']);
	return (
		<Dynamic component={local.as ?? 'section'} {...rest} class={cx('c-card o-box', local.class)} />
	);
}

export function CardHeader(props: ComponentProps<'hgroup'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <hgroup {...rest} class={cx('c-card__header', local.class)} />;
}

export function CardTitle(props: ComponentProps<'h3'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <h3 {...rest} class={cx('c-card__title', local.class)} />;
}

export function CardDescription(props: ComponentProps<'p'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <p {...rest} class={cx('c-card__description', local.class)} />;
}

export function CardContent(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <div {...rest} class={cx('o-stack', local.class)} />;
}
