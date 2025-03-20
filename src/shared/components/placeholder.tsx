import '~/shared/components/placeholder.css';

import cx from 'classix';
import { For, type JSX, splitProps, Suspense } from 'solid-js';
import { isServer } from 'solid-js/web';

import { randInt } from '~/shared/utility/random';

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
export function InlinePlaceholder(props: JSX.HTMLAttributes<HTMLSpanElement>) {
	const [local, rest] = splitProps(props, ['class']);

	return <span class={cx('c-placeholder--inline', local.class)} {...rest} />;
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
