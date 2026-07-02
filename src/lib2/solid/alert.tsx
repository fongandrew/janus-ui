/**
 * Alert (§13.7) — `c-alert`, toned via v-colors-*.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { type Variant, variantClass } from '~/lib2/solid/variants';

export interface AlertProps extends ComponentProps<'div'> {
	/** Maps to v-colors-*. */
	variant?: Variant | undefined;
}

export function Alert(props: AlertProps) {
	const [local, rest] = splitProps(props, ['variant', 'class']);
	return (
		<div
			role="alert"
			{...rest}
			class={cx('c-alert', variantClass(local.variant), local.class)}
		/>
	);
}
