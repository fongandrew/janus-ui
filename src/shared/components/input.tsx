import cx from 'classix';
import { splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';

export interface InputProps extends FormElementProps<'input'> {
	/** Force callback ref */
	ref?: (el: HTMLInputElement) => void;
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formControlProps = mergeFormElementProps<'input'>(rest);
	return <input {...formControlProps} class={cx(!local.unstyled && 'c-input', props.class)} />;
}

export function InputDate(props: InputProps) {
	return <Input {...props} type="date" />;
}

export function InputTime(props: InputProps) {
	return <Input {...props} type="time" />;
}
