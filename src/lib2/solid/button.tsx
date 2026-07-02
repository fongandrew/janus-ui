import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';

import { ariaize } from '~/lib2/solid/aria';

export type ButtonVariant = 'primary' | 'danger' | 'success' | 'warn' | 'secondary';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
	primary: 'v-colors-primary',
	danger: 'v-colors-danger',
	success: 'v-colors-success',
	warn: 'v-colors-warn',
	secondary: 'v-colors-secondary',
};

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'disabled'> {
	variant?: ButtonVariant;
	/** Rendered as `aria-disabled` (never native `disabled`, §13.1). */
	disabled?: boolean;
	as?: 'button' | 'a';
}

export function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['variant', 'disabled', 'class', 'as']);
	return (
		<Dynamic
			component={local.as ?? 'button'}
			{...rest}
			{...ariaize({ disabled: local.disabled })}
			class={cx('c-button o-input-box', local.variant && VARIANT_CLASS[local.variant], local.class)}
		/>
	);
}

export function IconButton(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['variant', 'disabled', 'class', 'as']);
	return (
		<Dynamic
			component={local.as ?? 'button'}
			{...rest}
			{...ariaize({ disabled: local.disabled })}
			class={cx(
				'c-button c-button--icon o-input-box',
				local.variant && VARIANT_CLASS[local.variant],
				local.class,
			)}
		/>
	);
}
