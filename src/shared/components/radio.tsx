import cx from 'classix';
import { splitProps, useContext } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { RadioGroupContext } from '~/shared/components/radio-group-context';

export interface RadioProps extends Omit<FormElementProps<'input'>, 'type'> {}

export function Radio(props: RadioProps) {
	const [local, rest] = splitProps(props, ['checked', 'class']);
	const formProps = mergeFormElementProps<'input'>(rest);
	const group = useContext(RadioGroupContext);

	const isChecked = () => {
		if (group && 'value' in group) {
			return group.value() === props.value;
		}
		return local.checked;
	};

	return (
		<div class={cx('c-radio', local.class)}>
			<div class="c-radio__circle">
				<input
					type="radio"
					checked={isChecked()}
					name={group && 'name' in group ? group.name() : props.name}
					{...formProps}
				/>
				<span class="c-radio__dot" />
			</div>
		</div>
	);
}
