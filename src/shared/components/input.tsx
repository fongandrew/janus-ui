import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { useFormControl } from '~/shared/utility/use-form-control';

export interface InputProps extends JSX.InputHTMLAttributes<HTMLInputElement> {
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formControlProps = useFormControl(rest);
	return <input {...formControlProps} class={cx(!local.unstyled && 'c-input', props.class)} />;
}
