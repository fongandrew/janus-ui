/** `Toggle` (§13.7) — `c-toggle`. A `role="switch"` checkbox, pure CSS via `:checked`. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface ToggleProps extends Omit<ComponentProps<'input'>, 'type' | 'disabled'> {
	disabled?: boolean | undefined;
}

export function Toggle(props: ToggleProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class']);
	return (
		<label class={cx('c-toggle', local.class)}>
			<input
				type="checkbox"
				role="switch"
				{...rest}
				{...ariaize({ disabled: local.disabled })}
			/>
			<span class="c-toggle__thumb" />
		</label>
	);
}
