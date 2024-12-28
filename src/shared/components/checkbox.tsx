import cx from 'classix';
import { Check, Minus } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { useFormControl } from '~/shared/components/use-form-control';

export interface CheckboxProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	/**
	 * Whether the checkbox is in an indeterminate state
	 */
	indeterminate?: boolean;
}

export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, ['indeterminate', 'checked', 'class']);
	const formProps = useFormControl(rest);

	return (
		<div class={cx('c-checkbox', local.class)}>
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
	);
}
