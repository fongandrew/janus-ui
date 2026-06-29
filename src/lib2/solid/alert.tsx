/**
 * `Alert` (§13.7). A toned text-mode message. Defaults to `role="alert"`.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import type { ButtonVariant } from '~/lib2/solid/button';

export interface AlertProps extends ComponentProps<'div'> {
	variant?: ButtonVariant;
}

export function Alert(props: AlertProps) {
	const [local, rest] = splitProps(props, ['variant', 'class', 'role']);
	return (
		<div
			{...rest}
			role={local.role ?? 'alert'}
			class={cx('c-alert', local.variant && `v-colors-${local.variant}`, local.class)}
		/>
	);
}
