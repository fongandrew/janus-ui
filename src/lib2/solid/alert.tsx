import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export type AlertVariant = 'info' | 'success' | 'warn' | 'danger';

const VARIANT_CLASS: Record<AlertVariant, string> = {
	info: 'v-colors-info',
	success: 'v-colors-success',
	warn: 'v-colors-warn',
	danger: 'v-colors-danger',
};

export interface AlertProps extends ComponentProps<'div'> {
	variant?: AlertVariant;
}

/** Alert (§10.1) — a `c-alert` region, `role="alert"` by default. */
export function Alert(props: AlertProps) {
	const [local, rest] = splitProps(props, ['variant', 'class', 'role']);
	return (
		<div
			{...rest}
			role={local.role ?? 'alert'}
			class={cx('c-alert', local.variant && VARIANT_CLASS[local.variant], local.class)}
		/>
	);
}
