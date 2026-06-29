/**
 * `Radio` / `RadioGroup` (§13.7). The group renders a `<fieldset role="radiogroup">`
 * wired for roving focus; each radio is a custom control over a native input.
 */
import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface RadioProps
	extends Omit<ComponentProps<'input'>, 'type' | 'disabled' | 'children'> {
	disabled?: boolean;
	children?: JSX.Element;
}

export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class', 'children']);
	return (
		<label class={cx('c-radio', local.class)}>
			<span class="c-radio__circle">
				<input {...rest} type="radio" aria-disabled={local.disabled || undefined} />
			</span>
			<span class="c-radio__dot" />
			{local.children}
		</label>
	);
}

export interface RadioGroupProps extends ComponentProps<'fieldset'> {
	legend?: JSX.Element;
}

export function RadioGroup(props: RadioGroupProps) {
	const [local, rest] = splitProps(props, ['legend', 'class', 'children']);
	return (
		<fieldset
			{...rest}
			role="radiogroup"
			data-js="t-roving-focus"
			aria-orientation="vertical"
			class={cx('o-stack', local.class)}
		>
			{local.legend != null ? <legend>{local.legend}</legend> : null}
			{local.children}
		</fieldset>
	);
}
