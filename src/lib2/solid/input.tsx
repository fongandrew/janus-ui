import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { addValidator, type Validator } from '~/lib2/dom';
import { ariaize } from '~/lib2/solid/aria';

export interface InputProps extends Omit<ComponentProps<'input'>, 'disabled'> {
	/** Space-separated names of validators registered via registerValidator(). */
	validators?: string;
	/** Inline closure validator, stored in the DOM layer's WeakMap via ref. */
	onValidate?: Validator;
	/** Rendered as `aria-disabled` (§13.1). */
	disabled?: boolean;
	invalid?: boolean;
}

export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, [
		'validators',
		'onValidate',
		'disabled',
		'invalid',
		'class',
		'ref',
	]);

	const setRef = (el: HTMLInputElement) => {
		if (typeof local.ref === 'function') (local.ref as (el: HTMLInputElement) => void)(el);
		if (local.onValidate) onCleanup(addValidator(el, local.onValidate));
	};

	return (
		<input
			{...rest}
			ref={setRef}
			data-validators={local.validators}
			{...ariaize({ disabled: local.disabled, invalid: local.invalid })}
			class={cx('c-input o-input-box', local.class)}
		/>
	);
}
