import cx from 'classix';
import { Check, Minus } from 'lucide-solid';
import { type JSX, splitProps } from 'solid-js';

import { mergeFormControlProps } from '~/shared/components/merge-form-control-props';

export interface CheckboxProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'> {
	/** Force callback ref */
	ref?: (el: HTMLInputElement) => void;
	/**
	 * Whether the checkbox is in an indeterminate state
	 */
	indeterminate?: boolean;
}

export function Checkbox(props: CheckboxProps) {
	const [local, rest] = splitProps(props, ['indeterminate', 'checked', 'class']);
	const formProps = mergeFormControlProps(rest);

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
