import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { useFormControl } from '~/shared/components/use-form-control';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formControlProps = useFormControl(rest);
	return <input {...formControlProps} class={cx(!local.unstyled && 'c-input', props.class)} />;
}

export function InputDate(props: InputProps) {
	return <Input {...props} type="date" />;
}

export function InputTime(props: InputProps) {
	return <Input {...props} type="time" />;
}
