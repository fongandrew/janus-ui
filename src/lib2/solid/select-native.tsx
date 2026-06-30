/** `SelectNative` (§13.7) — chrome around a native `<select>` (`c-select-native`). */

import cx from 'classix';
import { type ComponentProps, For, type JSX, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface SelectOption {
	value: string;
	label: string;
}

export interface SelectNativeProps extends Omit<ComponentProps<'select'>, 'disabled' | 'children'> {
	disabled?: boolean | undefined;
	required?: boolean | undefined;
	/** Convenience: a flat option list. Use `children` for `<optgroup>` or other structure. */
	options?: SelectOption[] | undefined;
	children?: JSX.Element;
}

export function SelectNative(props: SelectNativeProps) {
	const [local, rest] = splitProps(props, [
		'disabled',
		'required',
		'options',
		'children',
		'class',
	]);
	return (
		<select
			{...rest}
			{...ariaize({ disabled: local.disabled, required: local.required })}
			class={cx('c-select-native', local.class)}
		>
			{local.children}
			<For each={local.options}>
				{(opt) => <option value={opt.value}>{opt.label}</option>}
			</For>
		</select>
	);
}
