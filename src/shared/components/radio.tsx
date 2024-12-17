import cx from 'classix';
import { Circle } from 'lucide-solid';
import { type JSX, splitProps, useContext } from 'solid-js';

import { RadioGroupContext } from '~/shared/components/radio-group-context';
import { useFormControl } from '~/shared/utility/use-form-control';

export type RadioProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['checked', 'class', 'onChange']);
	const formProps = useFormControl(rest);
	const group = useContext(RadioGroupContext);

	const isChecked = () => {
		if (group && 'value' in group) {
			return group.value() === props.value;
		}
		return local.checked;
	};

	const handleChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (event) => {
		if (typeof local.onChange === 'function') {
			local.onChange(event);
			if (event.defaultPrevented) {
				return;
			}
		}
		if (group && 'onChange' in group) {
			group.onChange(event);
		}
	};

	return (
		<div class={cx('c-radio', local.class)}>
			<input
				type="radio"
				checked={isChecked()}
				name={group && 'name' in group ? group.name() : props.name}
				onChange={handleChange}
				{...formProps}
			/>
			<Circle class="c-radio__dot" />
		</div>
	);
}
