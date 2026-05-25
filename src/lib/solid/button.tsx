import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'primary' | 'danger' | 'success' | 'secondary';
	disabled?: boolean;
}

export function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['variant', 'disabled', 'class']);
	return (
		<button
			class={attrs('c-button o-input-box', local.variant && `v-colors-${local.variant}`, local.class)}
			aria-disabled={local.disabled ? 'true' : undefined}
			{...rest}
		/>
	);
}

export interface IconButtonProps extends ButtonProps {
	label: string;
}

export function IconButton(props: IconButtonProps) {
	const [local, rest] = splitProps(props, ['variant', 'disabled', 'class', 'label']);
	return (
		<button
			class={attrs('c-button c-button--icon o-input-box', local.variant && `v-colors-${local.variant}`, local.class)}
			aria-disabled={local.disabled ? 'true' : undefined}
			aria-label={local.label}
			{...rest}
		/>
	);
}
