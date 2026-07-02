import cx from 'classix';
import { type ComponentProps, For, Show, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface SelectOption {
	value: string;
	label: string;
}

export interface SelectNativeProps extends Omit<ComponentProps<'select'>, 'disabled'> {
	/** Convenience option list; when omitted, render `children` (`<option>`s). */
	options?: SelectOption[];
	/** Rendered as `aria-disabled` (§13.1). */
	disabled?: boolean;
	invalid?: boolean;
}

/** SelectNative (§10.1) — `c-select-native o-input-box` styled `<select>`. */
export function SelectNative(props: SelectNativeProps) {
	const [local, rest] = splitProps(props, [
		'options',
		'disabled',
		'invalid',
		'class',
		'children',
	]);
	return (
		<select
			{...rest}
			{...ariaize({ disabled: local.disabled ?? false, invalid: local.invalid ?? false })}
			class={cx('c-select-native o-input-box', local.class)}
		>
			<Show when={local.options} fallback={local.children}>
				{(options) => (
					<For each={options()}>
						{(option) => <option value={option.value}>{option.label}</option>}
					</For>
				)}
			</Show>
		</select>
	);
}
