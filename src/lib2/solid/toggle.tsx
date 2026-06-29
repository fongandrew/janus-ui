/**
 * `Toggle` (§13.7). A switch over a native `<input type="checkbox" role="switch">`,
 * wrapped in a `<label>` row with text.
 */
import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

export interface ToggleProps
	extends Omit<ComponentProps<'input'>, 'type' | 'disabled' | 'children'> {
	disabled?: boolean;
	children?: JSX.Element;
}

export function Toggle(props: ToggleProps) {
	const [local, rest] = splitProps(props, ['disabled', 'class', 'children']);
	return (
		<label class={cx('o-row', local.class)}>
			<span class="c-toggle">
				<input
					{...rest}
					type="checkbox"
					role="switch"
					aria-disabled={local.disabled || undefined}
				/>
				<span class="c-toggle__thumb" />
			</span>
			{local.children}
		</label>
	);
}
