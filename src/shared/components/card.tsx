import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { ErrorFallback } from '~/shared/components/error-fallback';

export type CardProps = JSX.IntrinsicAttributes &
	Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onError'> & {
		as?: 'article' | 'div' | 'section';
		/** Error boundary render callback */
		onError?: ((err: Error & { code: string }, eventId: string) => void) | undefined;
		/** Error boundary reload callback */
		onReload?: (() => void) | undefined;
	};

export type CardHeaderProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLElement>;
export type CardTitleProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLHeadingElement>;
export type CardDescriptionProps = JSX.IntrinsicAttributes &
	JSX.HTMLAttributes<HTMLParagraphElement>;
export type CardContentProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>;

export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['as', 'onError', 'onReload']);
	return (
		<Dynamic component={local.as || 'section'} {...rest} class={cx('c-card', props.class)}>
			<ErrorFallback onError={local.onError} onReload={local.onReload} stretch>
				{props.children}
			</ErrorFallback>
		</Dynamic>
	);
}

export function CardHeader(props: CardHeaderProps) {
	return <hgroup {...props} class={cx('c-card__header', props.class)} />;
}

export function CardTitle(props: CardTitleProps) {
	return <h3 {...props} />;
}

export function CardDescription(props: CardDescriptionProps) {
	return <p {...props} class={cx('c-card__description', props.class)} />;
}

export function CardContent(props: CardContentProps) {
	return <div {...props} class={cx('c-card__content', props.class)} />;
}

export function CardFooter(props: CardFooterProps) {
	return <div {...props} class={cx('c-card__footer', props.class)} />;
}
