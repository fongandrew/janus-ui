/**
 * `SelectNative` (§13.7). Styled chrome around a native `<select>`.
 */
import cx from 'classix';
import { type ComponentProps, For, splitProps } from 'solid-js';

export interface SelectOption {
	value: string;
	label: string;
}

export interface SelectNativeProps extends Omit<ComponentProps<'select'>, 'disabled'> {
	options?: SelectOption[];
	disabled?: boolean;
}

export function SelectNative(props: SelectNativeProps) {
	const [local, rest] = splitProps(props, ['options', 'disabled', 'class', 'children']);
	return (
		<select
			{...rest}
			aria-disabled={local.disabled || undefined}
			class={cx('c-select-native', local.class)}
		>
			{local.options ? (
				<For each={local.options}>{(o) => <option value={o.value}>{o.label}</option>}</For>
			) : (
				local.children
			)}
		</select>
	);
}
