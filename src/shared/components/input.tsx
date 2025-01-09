import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import {
	type FormControlProps,
	mergeFormControlProps,
} from '~/shared/components/merge-form-control-props';

export interface InputProps
	extends JSX.InputHTMLAttributes<HTMLInputElement>,
		FormControlProps<HTMLInputElement> {
	/** Force callback ref */
	ref?: (el: HTMLInputElement) => void;
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formControlProps = mergeFormControlProps<HTMLInputElement, InputProps>(rest);
	return <input {...formControlProps} class={cx(!local.unstyled && 'c-input', props.class)} />;
}

export function InputDate(props: InputProps) {
	return <Input {...props} type="date" />;
}

export function InputTime(props: InputProps) {
	return <Input {...props} type="time" />;
}
