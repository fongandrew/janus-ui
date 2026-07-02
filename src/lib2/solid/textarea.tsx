import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { addValidator, type Validator } from '~/lib2/dom';
import { ariaize } from '~/lib2/solid/aria';

export interface TextareaProps extends Omit<ComponentProps<'textarea'>, 'disabled'> {
	/** Space-separated names of validators registered via registerValidator(). */
	validators?: string;
	/** Inline closure validator, stored in the DOM layer's WeakMap via ref. */
	onValidate?: Validator;
	/** Rendered as `aria-disabled` (§13.1). */
	disabled?: boolean;
	invalid?: boolean;
}

/** Textarea (§10.1) — same validation contract as `Input` (§13.4). */
export function Textarea(props: TextareaProps) {
	const [local, rest] = splitProps(props, [
		'validators',
		'onValidate',
		'disabled',
		'invalid',
		'class',
		'ref',
	]);

	const setRef = (el: HTMLTextAreaElement) => {
		if (typeof local.ref === 'function') (local.ref as (el: HTMLTextAreaElement) => void)(el);
		if (local.onValidate) onCleanup(addValidator(el, local.onValidate));
	};

	return (
		<textarea
			{...rest}
			ref={setRef}
			data-validators={local.validators}
			{...ariaize({ disabled: local.disabled ?? false, invalid: local.invalid ?? false })}
			class={cx('c-input o-input-box', local.class)}
		/>
	);
}
