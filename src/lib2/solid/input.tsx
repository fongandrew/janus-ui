/**
 * Input (§13.7, §13.4) — `c-input o-input-box` with the two validation
 * props: `validators` (named registry) and `onValidate` (closure → WeakMap
 * via ref, no per-element listener).
 */
import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { addValidator, type Validator } from '~/lib2/dom';
import { ariaize } from '~/lib2/solid/aria';

export interface InputProps extends ComponentProps<'input'> {
	/** Space-separated names of validators registered via registerValidator(). */
	validators?: string | undefined;
	/** Inline closure validator. Stored in dom/'s WeakMap via ref (§13.4). */
	onValidate?: Validator | undefined;
	invalid?: boolean | undefined;
	'data-js'?: string | undefined;
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
	return (
		<input
			{...rest}
			class={cx('c-input o-input-box', local.class)}
			data-validators={local.validators}
			{...ariaize({ disabled: local.disabled, invalid: local.invalid })}
			ref={(el) => {
				if (typeof local.ref === 'function') local.ref(el);
				if (local.onValidate) onCleanup(addValidator(el, local.onValidate));
			}}
		/>
	);
}
