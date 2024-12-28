import cx from 'classix';
import { type JSX } from 'solid-js';

import { useFormControl } from '~/shared/components/use-form-control';

export function Textarea(
	props: JSX.IntrinsicAttributes & JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
	const rest = useFormControl(props);
	return <textarea {...rest} class={cx('c-textarea', props.class)} />;
}
