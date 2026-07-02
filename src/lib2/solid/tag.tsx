/**
 * Tag (§13.7) — `c-tag` with optional remove button.
 */
import cx from 'classix';
import { type ComponentProps, Show, splitProps } from 'solid-js';

import { type Variant, variantClass } from '~/lib2/solid/variants';

export interface TagProps extends ComponentProps<'span'> {
	variant?: Variant | undefined;
	/** Renders an × remove button when provided. */
	onRemove?: (() => void) | undefined;
	removeLabel?: string | undefined;
}

export function Tag(props: TagProps) {
	const [local, rest] = splitProps(props, [
		'variant',
		'onRemove',
		'removeLabel',
		'class',
		'children',
	]);
	return (
		<span {...rest} class={cx('c-tag o-caption', variantClass(local.variant), local.class)}>
			{local.children}
			<Show when={local.onRemove}>
				<button
					type="button"
					class="c-tag__remove"
					aria-label={local.removeLabel ?? 'Remove'}
					onClick={() => local.onRemove?.()}
				>
					×
				</button>
			</Show>
		</span>
	);
}
