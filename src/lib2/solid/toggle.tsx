import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface ToggleProps extends Omit<ComponentProps<'input'>, 'disabled' | 'type'> {
	/** Rendered as `aria-disabled` (§13.1). */
	disabled?: boolean;
	/** Optional inline label; when present the input is wrapped in a `<label>`. */
	label?: JSX.Element;
}

/** Toggle (§10.1) — `<input type="checkbox" role="switch" class="c-toggle">`. */
export function Toggle(props: ToggleProps) {
	const [local, rest] = splitProps(props, ['class', 'disabled', 'label']);

	const input = (
		<input
			{...rest}
			type="checkbox"
			role="switch"
			{...ariaize({ disabled: local.disabled ?? false })}
			class={cx('c-toggle', local.class)}
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
