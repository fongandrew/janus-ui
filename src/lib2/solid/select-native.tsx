/**
 * SelectNative (§13.7) — native `<select>` (`c-select-native o-input-box`).
 * Plain-text options; rendered content needs StyledSelect.
 */
import cx from 'classix';
import { type ComponentProps, For, type JSX, Show, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface SelectNativeOption {
	value: string;
	label: JSX.Element;
}

export interface SelectNativeProps extends ComponentProps<'select'> {
	/** Convenience prop; or pass <option> children yourself. */
	options?: SelectNativeOption[] | undefined;
}

export function SelectNative(props: SelectNativeProps) {
	const [local, rest] = splitProps(props, ['options', 'disabled', 'class', 'children']);
	return (
		<select
			{...rest}
			class={cx('c-select-native o-input-box', local.class)}
			{...ariaize({ disabled: local.disabled })}
		>
			<Show when={local.options} fallback={local.children}>
				<For each={local.options}>
					{(option) => <option value={option.value}>{option.label}</option>}
				</For>
			</Show>
		</select>
	);
}
