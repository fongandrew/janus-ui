import cx from 'classix';
import { splitProps, useContext } from 'solid-js';

import { checkboxEnter } from '~/shared/components/callbacks/checkbox';
import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { RadioGroupContext } from '~/shared/components/radio-group-context';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export interface RadioProps extends Omit<FormElementProps<'input'>, 'type'> {}

/**
 * Radio button component for single-choice selection
 *
 * @example
 * ```tsx
 * // Inside a RadioGroup
 * const [value, setValue] = createSignal('option1');
 * 	<RadioGroup
 * 		name="options"
 * 		value={value()}
 * 		onValue={setValue}
 * 	>
 * 		<Label>
 * 			<Radio value="option1" /> Option 1
 * 		</Label>
 * 		<Label>
 * 			<Radio value="option2" /> Option 2
 * 		</Label>
 * 		<Label>
 * 			<Radio value="option3" disabled /> Disabled option
 * 		</Label>
 * 	</RadioGroup>
 * ```
 */
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
					{...callbackAttrs(formProps, checkboxEnter)}
				/>
				<span class="c-radio__dot" />
			</div>
		</div>
	);
}
