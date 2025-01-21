import cx from 'classix';
import { Check, Minus } from 'lucide-solid';
import { splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';

export interface CheckboxProps extends Omit<FormElementProps<'input'>, 'type'> {
	/**
	 * Whether the checkbox is in an indeterminate state
	 */
	indeterminate?: boolean;
}

export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, ['indeterminate', 'checked', 'class']);
	const formProps = mergeFormElementProps<'input'>(rest);

	return (
		<div class={cx('c-checkbox', local.class)}>
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
