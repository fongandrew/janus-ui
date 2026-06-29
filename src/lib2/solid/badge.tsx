/**
 * `Badge` (§13.7). A count badge, or a dot-indicator in `dot` mode.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import type { ButtonVariant } from '~/lib2/solid/button';

export interface BadgeProps extends ComponentProps<'span'> {
	variant?: ButtonVariant;
	dot?: boolean;
}

export function Badge(props: BadgeProps) {
	const [local, rest] = splitProps(props, ['variant', 'dot', 'class']);
	return (
		<span
			{...rest}
			class={cx(
				'c-badge',
				local.dot && 'c-badge--dot',
				local.variant && `v-colors-${local.variant}`,
				local.class,
			)}
		/>
	);
}
