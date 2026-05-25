import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	disabled?: boolean;
}

export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<input
			class={attrs('c-input o-input-box', local.class)}
			aria-disabled={local.disabled ? 'true' : undefined}
			{...rest}
		/>
	);
}

export interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
	disabled?: boolean;
}

export function Textarea(props: TextareaProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<textarea
			class={attrs('c-input o-input-box', local.class)}
			aria-disabled={local.disabled ? 'true' : undefined}
			{...rest}
		/>
	);
}
