import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { ErrorFallback } from '~/shared/components/error-fallback';
import { SpinnerSuspense } from '~/shared/components/spinner';

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

/**
 * Card container component with error boundary and suspense
 *
 * @example
 * ```tsx
 * // Basic card with header, content, and optional footer
 * 	<Card>
 * 		<CardHeader>
 * 			<CardTitle>Card Title</CardTitle>
 * 			<CardDescription>Optional card description</CardDescription>
 * 		</CardHeader>
 * 		<CardContent>
 * 			<p>Card content goes here</p>
 * 		</CardContent>
 * 		<CardFooter>
 * 			<Button>Action</Button>
 * 		</CardFooter>
 * 	</Card>
 *
 * // With different HTML element type
 * 	<Card as="article" id="article-card">
 * 		<CardHeader>
 * 			<CardTitle>Article Title</CardTitle>
 * 		</CardHeader>
 * 		<CardContent>
 * 			<p>Article content</p>
 * 		</CardContent>
 * 	</Card>
 * ```
 */
export function Card(props: CardProps) {
	const [local, rest] = splitProps(props, ['as', 'onError', 'onReload']);
	return (
		<Dynamic component={local.as || 'section'} {...rest} class={cx('c-card', props.class)}>
			<ErrorFallback onError={local.onError} onReload={local.onReload} stretch>
				<SpinnerSuspense>{props.children}</SpinnerSuspense>
			</ErrorFallback>
		</Dynamic>
	);
}

/**
 * Card header component that contains the title and description
 *
 * @example
 * ```tsx
 * 	<CardHeader>
 * 		<CardTitle>Card Title</CardTitle>
 * 		<CardDescription>Optional card description</CardDescription>
 * 	</CardHeader>
 * ```
 */
export function CardHeader(props: CardHeaderProps) {
	return <hgroup {...props} class={cx('c-card__header', props.class)} />;
}

/**
 * Card title component
 *
 * @example
 * ```tsx
 * 	<CardTitle>Card Title</CardTitle>
 * ```
 */
export function CardTitle(props: CardTitleProps) {
	return <h3 {...props} />;
}

/**
 * Card description component for additional information
 *
 * @example
 * ```tsx
 * 	<CardDescription>A brief description of this card's purpose</CardDescription>
 * ```
 */
export function CardDescription(props: CardDescriptionProps) {
	return <p {...props} class={cx('c-card__description', props.class)} />;
}

/**
 * Card content component for the main content area
 *
 * @example
 * ```tsx
 * 	<CardContent>
 * 		<p>Main content of the card goes here</p>
 * 		<div class="o-stack">
 * 			<p>You can include any components or content</p>
 * 			<Button>Action</Button>
 * 		</div>
 * 	</CardContent>
 * ```
 */
export function CardContent(props: CardContentProps) {
	return <div {...props} class={cx('c-card__content', props.class)} />;
}

/**
 * Card footer component typically used for actions
 *
 * @example
 * ```tsx
 * 	<CardFooter>
 * 		<Button class="v-colors-primary">Save</Button>
 * 		<Button>Cancel</Button>
 * 	</CardFooter>
 * ```
 */
export function CardFooter(props: CardFooterProps) {
	return <div {...props} class={cx('c-card__footer', props.class)} />;
}
