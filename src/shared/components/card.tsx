import '~/shared/components/card.css';

import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { FormContextProvider } from '~/shared/components/form-context-provider';

export type CardProps = JSX.IntrinsicAttributes &
	JSX.HTMLAttributes<HTMLDivElement> & {
		as?: 'article' | 'div' | 'section';
	};

export type CardHeaderProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>;
export type CardTitleProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLHeadingElement>;
export type CardDescriptionProps = JSX.IntrinsicAttributes &
	JSX.HTMLAttributes<HTMLParagraphElement>;
export type CardContentProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>;
export type CardFooterProps = JSX.IntrinsicAttributes & JSX.HTMLAttributes<HTMLDivElement>;

export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['as']);
	return (
		<Dynamic component={local.as || 'div'} {...rest} class={cx('c-card', props.class)}>
			<FormContextProvider>{props.children}</FormContextProvider>
		</Dynamic>
	);
}

export function CardHeader(props: CardHeaderProps) {
	return <div {...props} class={cx('c-card__header', props.class)} />;
}

export function CardTitle(props: CardTitleProps) {
	return <h3 {...props} class={cx('c-card__title', props.class)} />;
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
