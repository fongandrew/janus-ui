import cx from 'classix';
import { Check, Minus } from 'lucide-solid';
import { createEffect, splitProps } from 'solid-js';
import { isServer } from 'solid-js/web';

import {
	checkboxClick,
	checkboxEnter,
	checkboxIndeterminate,
} from '~/shared/components/callbacks/checkbox';
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

/**
 * Checkbox component with support for indeterminate state
 *
 * @example
 * ```tsx
 * // Basic checkbox
 * 	<Label>
 * 		<Checkbox name="default" />
 * 		Default checkbox
 * 	</Label>
 *
 * // Checked checkbox
 * 	<Label>
 * 		<Checkbox name="checked" checked />
 * 		Checked checkbox
 * 	</Label>
 *
 * // Indeterminate checkbox
 * 	<Label>
 * 		<Checkbox name="indeterminate" indeterminate />
 * 		Indeterminate checkbox
 * 	</Label>
 */
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
		<div class={cx('c-checkbox', local.class)} {...callbackAttrs(checkboxClick)}>
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
