import cx from 'classix';
import { splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';

export interface BaseInputProps extends FormElementProps<'input'> {
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

export interface InputProps extends Omit<BaseInputProps, 'type'> {
	/** Input type -- intentionally excluding some inputs for which there's a better component */
	type?: 'email' | 'file' | 'number' | 'search' | 'tel' | 'text' | 'url' | undefined;
	/** Called when typing happens */
	onValueInput?: ((value: string, event: Event) => void) | undefined;
}

/** General input with prop mod hookup */
export function BaseInput(props: BaseInputProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formControlProps = mergeFormElementProps<'input'>(rest);

	return <input {...formControlProps} class={cx(!local.unstyled && 'c-input', props.class)} />;
}

/** General text input with additional value handler
 *
 * @example
 * ```tsx
 * // Basic text input
 * 	<Input placeholder="Placeholder content" />
 *
 * // With different types
 * 	<Input type="email" autocomplete="email" />
 * 	<Input type="url" />
 *
 * // With states
 * 	<Input invalid placeholder="Some wrong value" />
 * 	<Input disabled placeholder="Can't touch this" />
 *
 * // Inside a LabelledInput
 * 	<LabelledInput label="Input some value">
 * 		<Input placeholder="Placeholder content" />
 * 	</LabelledInput>
 *
 * // With handlers
 * 	<Input
 * 		onValueInput={(value, event) => {
 * 			console.log('New value:', value);
 * 		}}
 * 		onValidate={(event) => {
 * 			 const value = event.currentTarget.value;
 *		if (value.includes(' ')) {
 *			return 'Username cannot contain spaces';
 *		}
 *		return null;
 * 		}}
 * />
 * ```
 */
export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, ['onValueInput']);

	const handleInput = (event: InputEvent) => {
		const target = event.target as HTMLInputElement;
		local.onValueInput?.(target.value, event);
	};

	return <BaseInput {...rest} {...extendHandler(rest, 'onInput', handleInput)} />;
}
