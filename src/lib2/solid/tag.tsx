/**
 * `Tag` (§13.7). A small chip composing `o-caption`. Optional remove button.
 */
import cx from 'classix';
import { type ComponentProps, Show, splitProps } from 'solid-js';

import type { ButtonVariant } from '~/lib2/solid/button';

export interface TagProps extends ComponentProps<'span'> {
	variant?: ButtonVariant;
	onRemove?: () => void;
}

export function Tag(props: TagProps) {
	const [local, rest] = splitProps(props, ['variant', 'onRemove', 'class', 'children']);
	return (
		<span
			{...rest}
			class={cx('c-tag', local.variant && `v-colors-${local.variant}`, local.class)}
		>
			{local.children}
			<Show when={local.onRemove}>
				<button
					type="button"
					class="c-tag__remove"
					aria-label="Remove"
					onClick={() => local.onRemove?.()}
				>
					×
				</button>
			</Show>
		</span>
	);
}
