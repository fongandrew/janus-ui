/** `Textarea` (§13.4, §13.7) — `c-input`, same validation props as `Input`. */

import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { addValidator, type Validator } from '~/lib2/dom';
import { ariaize } from '~/lib2/solid/aria';
import { combineRefs } from '~/lib2/solid/combine-refs';

export interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'disabled'> {
	disabled?: boolean | undefined;
	required?: boolean | undefined;
	invalid?: boolean | undefined;
	validators?: string | undefined;
	onValidate?: Validator<HTMLTextAreaElement> | undefined;
}

export function Textarea(props: TextareaProps) {
	const [local, rest] = splitProps(props, [
		'disabled',
		'required',
		'invalid',
		'validators',
		'onValidate',
		'class',
		'ref',
	]);
	return (
		<textarea
			{...rest}
			{...ariaize({
				disabled: local.disabled,
				required: local.required,
				invalid: local.invalid,
			})}
			data-validators={local.validators}
			class={cx('c-input', local.class)}
			ref={combineRefs(local.ref, (el: HTMLTextAreaElement) => {
				if (local.onValidate) {
					onCleanup(addValidator(el, local.onValidate));
				}
			})}
		/>
	);
}
