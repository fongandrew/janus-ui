import '~/shared/components/checkbox.css';

import cx from 'classix';
import { Check, Minus } from 'lucide-solid';
import { splitProps } from 'solid-js';

import { mergeFormElementProps } from '~/shared/components/form-element-props';

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

	return (
		<div class={cx('c-checkbox', local.class)} onClick={handleClick}>
			<div class="c-checkbox__box">
				<input
					type="checkbox"
					checked={local.checked}
					{...formProps}
					ref={(el) => {
						// Set indeterminate state on the input element
						if (el) el.indeterminate = local.indeterminate ?? false;
					}}
				/>
				<Check class="c-checkbox__check" />
				<Minus class="c-checkbox__indeterminate" />
			</div>
		</div>
	);
}
