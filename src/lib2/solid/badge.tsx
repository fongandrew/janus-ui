/**
 * Badge (§13.7) — `c-badge`, or `c-badge c-badge--dot` in dot-indicator mode.
 */
import cx from 'classix';
import { type ComponentProps, Show, splitProps } from 'solid-js';

import { type Variant, variantClass } from '~/lib2/solid/variants';

export interface BadgeProps extends ComponentProps<'span'> {
	variant?: Variant | undefined;
	/** Dot-indicator mode: no content, just presence. */
	dot?: boolean | undefined;
}

export function Badge(props: BadgeProps) {
	const [local, rest] = splitProps(props, ['variant', 'dot', 'class', 'children']);
	return (
		<span
			{...rest}
			class={cx(
				'c-badge',
				local.dot ? 'c-badge--dot' : 'o-caption',
				variantClass(local.variant),
				local.class,
			)}
		>
			<Show when={!local.dot}>{local.children}</Show>
		</span>
	);
}
