/**
 * `Checkbox` (§13.7). A custom-styled control over a visually-hidden native
 * `<input type="checkbox">`, wrapped in a `<label>` with text.
 */
import cx from 'classix';
import { type ComponentProps, createEffect, type JSX, splitProps } from 'solid-js';

export interface CheckboxProps
	extends Omit<ComponentProps<'input'>, 'type' | 'disabled' | 'children'> {
	disabled?: boolean;
	indeterminate?: boolean;
	children?: JSX.Element;
}

export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, [
		'disabled',
		'indeterminate',
		'class',
		'children',
		'ref',
	]);
	let input: HTMLInputElement | undefined;
	createEffect(() => {
		if (input) input.indeterminate = !!local.indeterminate;
	});
	return (
		<label class={cx('c-checkbox', local.class)}>
			<span class="c-checkbox__box">
				<input
					{...rest}
					type="checkbox"
					aria-disabled={local.disabled || undefined}
					ref={(el) => {
						input = el;
						if (typeof local.ref === 'function') local.ref(el);
					}}
				/>
				<span class="c-checkbox__check">✓</span>
				<span class="c-checkbox__indeterminate">–</span>
			</span>
			{local.children}
		</label>
	);
}
