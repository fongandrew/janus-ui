import cx from 'classix';
import { type ComponentProps, Show, splitProps } from 'solid-js';

export type TagVariant = 'primary' | 'danger' | 'success' | 'warn' | 'info' | 'secondary';

export interface TagProps extends ComponentProps<'span'> {
	variant?: TagVariant;
	/** When provided, renders a trailing `×` remove button. */
	onRemove?: () => void;
	removeLabel?: string;
}

/** Tag (§10.1) — `c-tag`, optional variant colors and a remove button. */
export function Tag(props: TagProps) {
	const [local, rest] = splitProps(props, [
		'variant',
		'onRemove',
		'removeLabel',
		'class',
		'children',
	]);
	return (
		<span
			{...rest}
			class={cx('c-tag o-caption', local.variant && `v-colors-${local.variant}`, local.class)}
		>
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
