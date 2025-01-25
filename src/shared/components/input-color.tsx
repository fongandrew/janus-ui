import { createSignal } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { handleEvent } from '~/shared/utility/solid/handle-event';

export interface InputColorProps extends Omit<FormElementProps<'input'>, 'type'> {
	/** Default uncontrolled value */
	defaultValue?: string | undefined;
	/** Value must be in string form */
	value?: string | undefined;
}

/**
 * Wrapper around a color input
 */
export function InputColor(props: InputColorProps) {
	const [uncontrolledValue, setUncontrolledValue] = createSignal<string | undefined>(
		props.defaultValue,
	);
	const value = () => (props.value as string | undefined) ?? uncontrolledValue() ?? '#000000';

	const handleChange = (event: Event) => {
		const target = event.target as HTMLInputElement;
		setUncontrolledValue(target.value);
		handleEvent(target, props.onChange, event);
	};

	const formControlProps = mergeFormElementProps<'input'>(props);
	return (
		<div class="c-input-color">
			<span style={{ background: value() }} class="c-input-color__swatch" />
			<span class="c-input-color__value">{value() ?? ''}</span>
			<input
				{...formControlProps}
				type="color"
				class="c-input-color__input"
				value={value()}
				onChange={handleChange}
			/>
		</div>
	);
}
