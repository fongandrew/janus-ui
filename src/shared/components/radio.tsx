import cx from 'classix';
import { type JSX, splitProps, useContext } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { RadioGroupContext } from '~/shared/components/radio-group-context';

export interface RadioProps extends Omit<FormElementProps<'input'>, 'type'> {}

export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['checked', 'class', 'onChange']);
	const formProps = mergeFormElementProps<'input'>(rest);
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
			<div class="c-radio__circle">
				<input
					type="radio"
					checked={isChecked()}
					name={group && 'name' in group ? group.name() : props.name}
					onChange={handleChange}
					{...formProps}
				/>
				<span class="c-radio__dot" />
			</div>
		</div>
	);
}
