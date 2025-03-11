import cx from 'classix';
import { ErrorBoundary, type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { T } from '~/shared/utility/text/t-components';

export type CardProps = JSX.IntrinsicAttributes &
	JSX.HTMLAttributes<HTMLDivElement> & {
		as?: 'article' | 'div' | 'section';
	};

export type CardHeaderProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLElement>;
export type CardTitleProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLHeadingElement>;
export type CardDescriptionProps = JSX.IntrinsicAttributes &
	JSX.HTMLAttributes<HTMLParagraphElement>;
export type CardContentProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>;

export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['as']);
	return (
		<ErrorBoundary fallback={<T>Something went wrong</T>}>
			<Dynamic component={local.as || 'section'} {...rest} class={cx('c-card', props.class)}>
				{props.children}
			</Dynamic>
		</ErrorBoundary>
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
