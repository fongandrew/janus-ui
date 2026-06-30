/** `Alert` (§13.7) — text-mode tonal callout over `c-alert`. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { colorsClass, type ColorVariant } from '~/lib2/solid/variant';

export interface AlertProps extends ComponentProps<'div'> {
	variant?: ColorVariant | undefined;
}

export function Alert(props: AlertProps) {
	const [local, rest] = splitProps(props, ['variant', 'class']);
	return (
		<div
			role="alert"
			{...rest}
			class={cx('c-alert', colorsClass(local.variant), local.class)}
		/>
	);
}
