import cx from 'classix';
import { Check, Minus } from 'lucide-solid';
import { createEffect, splitProps } from 'solid-js';
import { isServer } from 'solid-js/web';

import { checkboxEnter, checkboxIndeterminate } from '~/shared/components/callbacks/checkbox';
import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export interface CheckboxProps extends Omit<FormElementProps<'input'>, 'type'> {
	/**
	 * Whether the checkbox is in an indeterminate state
	 */
	indeterminate?: boolean;
}

/** Update checked state on click (screenreaders will do this automatically) */
export const handleClick = (e: MouseEvent) => {
	if (e.target instanceof HTMLInputElement) return;

	const input = (e.currentTarget as HTMLElement).querySelector('input');
	if (input) {
		const prevState = input.checked;
		// setTimeout in case click event triggers something further down
		// the propagation chain that would change the input.checked value
		// (like if it's inside a label)
		setTimeout(() => {
			input.indeterminate = false;
			input.checked = !prevState;
		}, 0);
	}
};

export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, ['indeterminate', 'checked', 'class']);
	const formProps = mergeFormElementProps<'input'>(rest);

	let input: HTMLInputElement | undefined;
	createEffect(() => {
		if (input) {
			input.indeterminate = local.indeterminate ?? false;
		}
	});

	return (
		<div class={cx('c-checkbox', local.class)} onClick={handleClick}>
			<div class="c-checkbox__box">
				<input
					ref={input}
					type="checkbox"
					checked={local.checked}
					{...formProps}
					{...callbackAttrs(
						formProps,
						checkboxEnter,
						isServer && local.indeterminate && checkboxIndeterminate,
					)}
				/>
				<Check class="c-checkbox__check" />
				<Minus class="c-checkbox__indeterminate" />
			</div>
		</div>
	);
}
