import cx from 'classix';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';

export interface TextareaProps extends Omit<FormElementProps<'textarea'>, 'type'> {}

export function Textarea(props: TextareaProps) {
	const rest = mergeFormElementProps<'textarea'>(props);
	return <textarea {...rest} class={cx('c-textarea', props.class)} />;
}
