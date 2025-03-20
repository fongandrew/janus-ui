import '~/shared/components/placeholder.css';

import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

export type PlaceholderProps = {
	class?: string;
	width?: string;
} & JSX.HTMLAttributes<HTMLDivElement>;

export type ImagePlaceholderProps = {
	class?: string;
	height?: number;
	width?: number;
	aspectRatio?: number;
} & JSX.HTMLAttributes<HTMLDivElement>;

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

/**
 * Image placeholder block with optional height, width, or aspect ratio
 */
export function ImagePlaceholder(props: ImagePlaceholderProps) {
	const [local, others] = splitProps(props, ['class', 'height', 'width', 'aspectRatio']);

	// Set style based on provided props
	const style = () => {
		if (local.aspectRatio) {
			return {
				width: local.width ? `${local.width}px` : '100%',
				'aspect-ratio': String(local.aspectRatio),
			};
		}

		return {
			height: local.height ? `${local.height}px` : 'auto',
			width: local.width ? `${local.width}px` : '100%',
		};
	};

	return <div class={cx('c-placeholder--image', local.class)} style={style()} {...others} />;
}

/**
 * Circular placeholder used for avatars or other circular elements
 */
export function CirclePlaceholder(props: ImagePlaceholderProps) {
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
