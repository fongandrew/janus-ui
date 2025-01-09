import cx from 'classix';
import { type JSX } from 'solid-js';

import {
	type FormControlProps,
	mergeFormControlProps,
} from '~/shared/components/merge-form-control-props';

export interface TextareaProps
	extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
		FormControlProps<HTMLTextAreaElement> {
	/** Force callback ref */
	ref?: (el: HTMLTextAreaElement) => void;
}

export function Textarea(props: TextareaProps) {
	const rest = mergeFormControlProps<HTMLTextAreaElement, TextareaProps>(props);
	return <textarea {...rest} class={cx('c-textarea', props.class)} />;
}
