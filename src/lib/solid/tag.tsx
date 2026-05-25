import { type JSX, Show, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface TagProps extends JSX.HTMLAttributes<HTMLSpanElement> {
	variant?: 'primary' | 'danger' | 'success' | 'warn' | 'info' | 'secondary';
	onRemove?: () => void;
}

export function Tag(props: TagProps) {
	const [local, rest] = splitProps(props, ['variant', 'class', 'onRemove', 'children']);
	return (
		<span class={attrs('c-tag', local.variant && `v-colors-${local.variant}`, local.class)} {...rest}>
			{local.children}
			<Show when={local.onRemove}>
				<button class="c-tag__remove" aria-label="Remove" onClick={local.onRemove}>
					&times;
				</button>
			</Show>
		</span>
	);
}
