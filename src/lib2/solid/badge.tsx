/** `Badge` (§13.7) — `c-badge`, a count/status marker. `dot` drops the text for a bare status dot. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { colorsClass, type ColorVariant } from '~/lib2/solid/variant';

export interface BadgeProps extends ComponentProps<'span'> {
	variant?: ColorVariant | undefined;
	dot?: boolean | undefined;
}

export function Badge(props: BadgeProps) {
	const [local, rest] = splitProps(props, ['variant', 'dot', 'class', 'children']);
	return (
		<span
			{...rest}
			class={cx(
				'c-badge',
				local.dot && 'c-badge--dot',
				colorsClass(local.variant),
				local.class,
			)}
		>
			{local.dot ? null : local.children}
		</span>
	);
}
