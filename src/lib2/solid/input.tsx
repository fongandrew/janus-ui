/** `Input` (§13.4, §13.7) — `c-input`. Validation props beyond native HTML5 attrs: `validators` (named registry) and `onValidate` (WeakMap closure). */

import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { addValidator, type Validator } from '~/lib2/dom';
import { ariaize } from '~/lib2/solid/aria';
import { combineRefs } from '~/lib2/solid/combine-refs';

export interface InputProps extends Omit<ComponentProps<'input'>, 'type' | 'disabled'> {
	type?: Exclude<NonNullable<ComponentProps<'input'>['type']>, 'checkbox' | 'radio'> | undefined;
	disabled?: boolean | undefined;
	required?: boolean | undefined;
	invalid?: boolean | undefined;
	/** Space-separated names of validators registered via `registerValidator()`. */
	validators?: string | undefined;
	/** Inline closure validator, attached via `addValidator()`. */
	onValidate?: Validator<HTMLInputElement> | undefined;
}

export function Input(props: InputProps) {
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
		<input
			{...rest}
			{...ariaize({
				disabled: local.disabled,
				required: local.required,
				invalid: local.invalid,
			})}
			data-validators={local.validators}
			class={cx('c-input', local.class)}
			ref={combineRefs(local.ref, (el: HTMLInputElement) => {
				if (local.onValidate) {
					onCleanup(addValidator(el, local.onValidate));
				}
			})}
		/>
	);
}
