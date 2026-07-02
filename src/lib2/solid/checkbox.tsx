import cx from 'classix';
import { type ComponentProps, createEffect, type JSX, Show, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';
import { mergeRefs } from '~/lib2/solid/utils';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'disabled' | 'type'> {
	/** Rendered as `aria-disabled` (§13.1). */
	disabled?: boolean;
	/** Sets the DOM `indeterminate` property via ref (no HTML attribute exists). */
	indeterminate?: boolean;
	/** Optional inline label; when present the input is wrapped in a `<label>`. */
	label?: JSX.Element;
}

/** Checkbox (§10.1) — `c-checkbox`, aria-disabled, indeterminate via ref. */
export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, ['class', 'disabled', 'indeterminate', 'label', 'ref']);

	let el: HTMLInputElement | undefined;
	const setRef = mergeRefs<HTMLInputElement>((node) => (el = node), local.ref);
	createEffect(() => {
		if (el) el.indeterminate = local.indeterminate ?? false;
	});

	const input = (
		<input
			{...rest}
			ref={setRef}
			type="checkbox"
			{...ariaize({ disabled: local.disabled ?? false })}
			class={cx('c-checkbox', local.class)}
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
