/**
 * `Button` / `IconButton` (§13.7). Thin prop→attribute mappers over `c-button`.
 * `disabled` always renders `aria-disabled` (never native `disabled`) per §13.1.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warn' | 'info';

export interface ButtonProps extends Omit<ComponentProps<'button'>, 'disabled'> {
	/** Maps to a `v-colors-*` tone. */
	variant?: ButtonVariant;
	/** Renders `aria-disabled` (keeps the control focusable + announced). */
	disabled?: boolean;
}

export function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['variant', 'disabled', 'class', 'type']);
	return (
		<button
			type={local.type ?? 'button'}
			{...rest}
			aria-disabled={local.disabled || undefined}
			class={cx('c-button', local.variant && `v-colors-${local.variant}`, local.class)}
		/>
	);
}

export interface IconButtonProps extends ButtonProps {
	/** Accessible label for the icon-only button. */
	label: string;
}

/** A square icon-only button. Requires a `label` for its accessible name. */
export function IconButton(props: IconButtonProps) {
	const [local, rest] = splitProps(props, ['label', 'class']);
	return <Button {...rest} aria-label={local.label} class={cx('c-button--icon', local.class)} />;
}
