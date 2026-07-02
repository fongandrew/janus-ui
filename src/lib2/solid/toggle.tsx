/**
 * Toggle (§13.7) — `<input type="checkbox" role="switch">` (`c-toggle`).
 */
import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface ToggleProps extends ComponentProps<'input'> {
	/** Optional inline label text; renders a wrapping <label class="o-row">. */
	label?: JSX.Element;
}

export function Toggle(props: ToggleProps) {
	const [local, rest] = splitProps(props, ['label', 'disabled', 'class']);
	const input = (
		<input
			type="checkbox"
			role="switch"
			{...rest}
			class={cx('c-toggle', local.class)}
			{...ariaize({ disabled: local.disabled })}
		/>
	);
	return (
		<Show when={local.label !== undefined} fallback={input}>
			<label class="o-row">
				{input}
				<span>{local.label}</span>
			</label>
		</Show>
	);
}
