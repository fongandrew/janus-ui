/**
 * `Input` (§13.4). Renders `<input class="c-input">` with the two validation props:
 * `validators` (named registry, via `data-validators`) and `onValidate` (closure,
 * attached to `dom/`'s WeakMap via ref — no per-element event listener).
 */
import cx from 'classix';
import { type ComponentProps, onCleanup, splitProps } from 'solid-js';

import { addValidator, type Validator } from '~/lib2/dom/form';

type InputType = Exclude<ComponentProps<'input'>['type'], 'checkbox' | 'radio'>;

export interface InputProps extends Omit<ComponentProps<'input'>, 'type' | 'disabled' | 'ref'> {
	type?: InputType;
	/** Space-separated names of validators registered via `registerValidator()`. */
	validators?: string;
	/** Inline closure validator — stored in `dom/`'s WeakMap via ref. */
	onValidate?: Validator<HTMLInputElement>;
	/** Renders `aria-disabled` (never native `disabled`). */
	disabled?: boolean;
	invalid?: boolean;
	ref?: (el: HTMLInputElement) => void;
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
			ref={(el) => {
				local.ref?.(el);
				if (local.onValidate) onCleanup(addValidator(el, local.onValidate));
			}}
			data-validators={local.validators}
			aria-disabled={local.disabled || undefined}
			aria-invalid={local.invalid || undefined}
			class={cx('c-input', local.class)}
		/>
	);
}
