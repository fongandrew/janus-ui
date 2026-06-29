/**
 * `Textarea` (§13.7). Same validation props as `Input`, rendered on `<textarea>`.
 */
import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { addValidator, type Validator } from '~/lib2/dom/form';

export interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'disabled' | 'ref'> {
	validators?: string;
	onValidate?: Validator<HTMLTextAreaElement>;
	disabled?: boolean;
	invalid?: boolean;
	ref?: (el: HTMLTextAreaElement) => void;
}

export function Textarea(props: TextareaProps) {
	const [local, rest] = splitProps(props, [
		'validators',
		'onValidate',
		'disabled',
		'invalid',
		'class',
		'ref',
	]);
	return (
		<textarea
			{...rest}
			ref={(el) => {
				local.ref?.(el);
				if (local.onValidate) onCleanup(addValidator(el, local.onValidate));
			}}
			data-validators={local.validators}
			aria-disabled={local.disabled || undefined}
			aria-invalid={local.invalid || undefined}
			class={cx('c-textarea', local.class)}
		/>
	);
}
