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

/** General text input with additional value handler */
export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, ['onValueInput']);

	const handleInput = (event: InputEvent) => {
		const target = event.target as HTMLInputElement;
		local.onValueInput?.(target.value, event);
	};

	return <BaseInput {...rest} {...extendHandler(rest, 'onInput', handleInput)} />;
}
