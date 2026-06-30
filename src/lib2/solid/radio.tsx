/** `Radio` / `RadioGroup` (§13.7) — `c-radio`. `RadioGroup` wires `t-roving-focus`. */

import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

import { ca } from '~/lib2/dom';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';
import { ariaize } from '~/lib2/solid/aria';

export function RadioGroup(props: ComponentProps<'fieldset'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<fieldset
			{...ca(rovingFocus({ axis: 'vertical', homeEnd: true }), { role: 'radiogroup' })}
			{...rest}
			class={cx('o-stack o-stack--tight', local.class)}
		/>
	);
}

export interface RadioProps extends Omit<ComponentProps<'input'>, 'type' | 'disabled'> {
	disabled?: boolean | undefined;
	children?: JSX.Element;
}

export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['disabled', 'children', 'class']);
	return (
		<label class={cx('c-radio', local.class)}>
			<span class="c-radio__circle">
				<input type="radio" {...rest} {...ariaize({ disabled: local.disabled })} />
				<span class="c-radio__dot" />
			</span>
			{local.children}
		</label>
	);
}
