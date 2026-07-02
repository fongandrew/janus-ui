import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export type BadgeVariant = 'primary' | 'danger' | 'success' | 'warn' | 'info' | 'secondary';

export interface BadgeProps extends ComponentProps<'span'> {
	variant?: BadgeVariant;
	/** Dot-indicator mode — renders a small dot instead of content. */
	dot?: boolean;
}

/** Badge (§10.1) — `c-badge`, optional variant colors and dot mode. */
export function Badge(props: BadgeProps) {
	const [local, rest] = splitProps(props, ['variant', 'dot', 'class', 'children']);
	return (
		<span
			{...rest}
			class={cx(
				'c-badge o-caption',
				local.dot && 'c-badge--dot',
				local.variant && `v-colors-${local.variant}`,
				local.class,
			)}
		>
			{local.dot ? null : local.children}
		</span>
	);
}
