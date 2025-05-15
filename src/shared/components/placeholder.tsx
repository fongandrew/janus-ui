import '~/shared/components/placeholder.css';

import cx from 'classix';
import { For, type JSX, splitProps, Suspense } from 'solid-js';
import { isServer } from 'solid-js/web';

import {
	PLACEHOLDER_DELAY_ATTR,
	placeholderDelayedHide,
	placeholderDelayedShow,
} from '~/shared/components/callbacks/placeholder';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { randInt } from '~/shared/utility/random';
import { useT } from '~/shared/utility/solid/locale-context';

export interface PlaceholderProps extends JSX.HTMLAttributes<HTMLDivElement> {
	width?: string | undefined;
}

export interface ImgPlaceholderProps extends JSX.HTMLAttributes<HTMLDivElement> {
	class?: string | undefined;
	height?: string | number | undefined;
	width?: string | number | undefined;
	aspectRatio?: number | undefined;
}

/**
 * Full width placeholder used for block elements like a card
 */
export function Placeholder(props: PlaceholderProps) {
	const [local, rest] = splitProps(props, ['class', 'width']);

	return (
		<div
			class={cx('c-placeholder', local.class)}
			style={{ width: local.width || '100%' }}
			{...rest}
		/>
	);
}

/**
 * Fixed width pill placeholder, used for inline elements in text
 */
export function MissingPlaceholder(props: JSX.HTMLAttributes<HTMLSpanElement>) {
	const [local, rest] = splitProps(props, ['class']);
	const t = useT();

	return (
		<span class={cx('c-placeholder--missing', local.class)} aria-label={t`Missing`} {...rest} />
	);
}

/**
 * Show placeholder for a given amount of time before rendering content
 */
export function DelayedPlaceholder(props: {
	delay?: number | undefined;
	fallback?: JSX.Element;
	children: JSX.Element;
}) {
	return (
		<>
			<div
				{...{ [PLACEHOLDER_DELAY_ATTR]: String(props.delay ?? 3000) }}
				{...callbackAttrs(placeholderDelayedHide)}
			>
				{props.fallback ?? <Placeholder />}
			</div>
			<div
				class="t-hidden"
				{...{ [PLACEHOLDER_DELAY_ATTR]: String(props.delay ?? 3000) }}
				{...callbackAttrs(placeholderDelayedShow)}
			>
				{props.children}
			</div>
		</>
	);
}

/**
 * Fixed width pill placeholder, used for inline elements in text
 */
export function InlinePlaceholder(props: JSX.HTMLAttributes<HTMLSpanElement>) {
	const [local, rest] = splitProps(props, ['class']);
	const t = useT();

	return (
		<span class={cx('c-placeholder--inline', local.class)} aria-label={t`Loading…`} {...rest} />
	);
}

/**
 * Fixed width pill placeholder, used for inline elements in text
 */
export function InlineMissingPlaceholder(props: JSX.HTMLAttributes<HTMLSpanElement>) {
	const [local, rest] = splitProps(props, ['class']);
	const t = useT();

	return (
		<span
			class={cx('c-placeholder--inline-missing', local.class)}
			aria-label={t`Missing`}
			{...rest}
		/>
	);
}

/**
 * Show placeholder for a given amount of time before rendering content
 */
export function InlineDelayedPlaceholder(props: {
	delay?: number | undefined;
	fallback?: JSX.Element;
	children: JSX.Element;
}) {
	return (
		<>
			<span
				{...{ [PLACEHOLDER_DELAY_ATTR]: String(props.delay ?? 3000) }}
				{...callbackAttrs(placeholderDelayedHide)}
			>
				{props.fallback ?? <InlinePlaceholder />}
			</span>
			<span
				class="t-hidden"
				{...{ [PLACEHOLDER_DELAY_ATTR]: String(props.delay ?? 3000) }}
				{...callbackAttrs(placeholderDelayedShow)}
			>
				{props.children}
			</span>
		</>
	);
}

/** Suspense wrapper for inline placeholder elements */
export function InlineSuspense(props: JSX.HTMLAttributes<HTMLSpanElement>) {
	const [local, rest] = splitProps(props, ['children']);
	return (
		<>
			{isServer ? (
				<>{local.children}</>
			) : (
				<Suspense fallback={<InlinePlaceholder {...rest} />}>{local.children}</Suspense>
			)}
		</>
	);
}

/**
 * Image placeholder block with optional height, width, or aspect ratio
 */
export function ImgPlaceholder(props: ImgPlaceholderProps) {
	const [local, others] = splitProps(props, ['class', 'height', 'width', 'aspectRatio']);
	return (
		<div
			class={cx('c-placeholder--img', local.class)}
			style={{
				'--c-placeholder__img-aspect-ratio': String(local.aspectRatio),
				height: local.height ? `${local.height}px` : 'auto',
				width: local.width ? `${local.width}px` : '100%',
			}}
			{...others}
		/>
	);
}

/**
 * Circular placeholder used for avatars or other circular elements
 */
export function CirclePlaceholder(props: ImgPlaceholderProps) {
	return <div {...props} class={cx('c-placeholder--circle', props.class)} />;
}

/**
 * Placeholder for chat message-like things
 */
export function ChatPlaceholder() {
	return (
		<div class="o-group">
			<CirclePlaceholder />
			<div class="t-flex-fill">
				<Placeholder width="100%" />
				<Placeholder width="85%" />
			</div>
		</div>
	);
}

/**
 * Placeholder for multiple lines in a paragraph
 */
export function ParagraphPlaceholder(props: { lines?: number | undefined }) {
	const length = () => props.lines ?? 3;
	return (
		<div>
			<For each={Array.from({ length: length() })}>
				{(_val, index) => (
					<Placeholder
						width={
							index() === 0
								? '100%'
								: `${randInt(index() === length() - 1 ? 66 : 85, 100)}%`
						}
					/>
				)}
			</For>
		</div>
	);
}
