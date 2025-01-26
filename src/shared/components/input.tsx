import cx from 'classix';
import { type Component, splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';

export interface BaseInputProps extends FormElementProps<'input'> {
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

export interface InputProps extends Omit<BaseInputProps, 'type'> {
	/** Input type -- intentionally excluding some inputs for which there's a better component */
	type?: 'email' | 'file' | 'number' | 'search' | 'tel' | 'text' | 'url' | undefined;
}

/** General text input */
export function BaseInput(props: BaseInputProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formControlProps = mergeFormElementProps<'input'>(rest);
	return <input {...formControlProps} class={cx(!local.unstyled && 'c-input', props.class)} />;
}

/** Export so it's typed to exclude things with better components */
export const Input = BaseInput as Component<InputProps>;
