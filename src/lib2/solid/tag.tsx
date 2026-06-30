/** `Tag` (§13.7) — `c-tag`, a small removable chip. */

import cx from 'classix';
import { X } from 'lucide-solid';
import { type ComponentProps, splitProps } from 'solid-js';

import { colorsClass, type ColorVariant } from '~/lib2/solid/variant';

export interface TagProps extends ComponentProps<'span'> {
	variant?: ColorVariant | undefined;
	/** Renders a remove (×) button when present. */
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
		<span {...rest} class={cx('c-tag', colorsClass(local.variant), local.class)}>
			{local.children}
			{local.onRemove ? (
				<button
					type="button"
					class="c-tag__remove"
					aria-label={local.removeLabel ?? 'Remove'}
					onClick={local.onRemove}
				>
					<X size="0.85em" />
				</button>
			) : null}
		</span>
	);
}
