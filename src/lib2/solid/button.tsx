/** `Button` / `IconButton` (§13.7) — thin wrappers over `c-button`. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';
import { colorsClass, type ColorVariant } from '~/lib2/solid/variant';

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'disabled'> {
	variant?: ColorVariant | undefined;
	disabled?: boolean | undefined;
}

export function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['variant', 'disabled', 'class']);
	return (
		<button
			type="button"
			{...rest}
			{...ariaize({ disabled: local.disabled })}
			class={cx('c-button', colorsClass(local.variant), local.class)}
		/>
	);
}

export interface IconButtonProps extends ButtonProps {
	/** Accessible label -- icon buttons carry no visible text. */
	label: string;
}

export function IconButton(props: IconButtonProps) {
	const [local, rest] = splitProps(props, ['label', 'class']);
	return <Button {...rest} aria-label={local.label} class={cx('c-button--icon', local.class)} />;
}
