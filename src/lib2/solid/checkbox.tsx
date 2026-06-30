/** `Checkbox` (§13.7) — `c-checkbox`. A real `<label>` wraps input + box + text, so toggling needs no JS click handler. */

import cx from 'classix';
import { Check, Minus } from 'lucide-solid';
import { type ComponentProps, createEffect, type JSX, splitProps } from 'solid-js';

import { ariaize } from '~/lib2/solid/aria';
import { combineRefs } from '~/lib2/solid/combine-refs';

export interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'disabled'> {
	disabled?: boolean | undefined;
	indeterminate?: boolean | undefined;
	children?: JSX.Element;
}

export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, [
		'disabled',
		'indeterminate',
		'children',
		'class',
		'ref',
	]);

	let inputEl: HTMLInputElement | undefined;
	createEffect(() => {
		if (inputEl) {
			inputEl.indeterminate = local.indeterminate ?? false;
		}
	});

	return (
		<label class={cx('c-checkbox', local.class)}>
			<span class="c-checkbox__box">
				<input
					type="checkbox"
					{...rest}
					{...ariaize({ disabled: local.disabled })}
					ref={combineRefs(local.ref, (el: HTMLInputElement) => {
						inputEl = el;
					})}
				/>
				<Check class="c-checkbox__check" />
				<Minus class="c-checkbox__indeterminate" />
			</span>
			{local.children}
		</label>
	);
}
