import cx from 'classix';
import { type JSX } from 'solid-js';

import { useFormControl } from '~/shared/utility/use-form-control';

export function Input(props: JSX.IntrinsicAttributes & JSX.InputHTMLAttributes<HTMLInputElement>) {
	const rest = useFormControl(props);
	return <input {...rest} class={cx('c-input', props.class)} />;
}
