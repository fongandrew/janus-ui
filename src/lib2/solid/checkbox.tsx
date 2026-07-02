/**
 * Checkbox (§13.7) — custom-styled native `<input type="checkbox">`
 * (`c-checkbox`). Pass `label` to get the `<label>` wrapper; otherwise give
 * it your own labelling (aria-label or LabelledInline).
 */
import cx from 'classix';
import { type ComponentProps, type JSX, Show, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';

export interface CheckboxProps extends ComponentProps<'input'> {
	indeterminate?: boolean | undefined;
	/** Optional inline label text; renders a wrapping <label class="o-row">. */
	label?: JSX.Element;
}

export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, ['indeterminate', 'label', 'disabled', 'class', 'ref']);
	const input = (
		<input
			type="checkbox"
			{...rest}
			class={cx('c-checkbox', local.class)}
			{...ariaize({ disabled: local.disabled })}
			ref={(el) => {
				if (typeof local.ref === 'function') local.ref(el);
				if (local.indeterminate) el.indeterminate = true;
			}}
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
