import cx from 'classix';
import { type JSX } from 'solid-js';

import { mergeFormControlProps } from '~/shared/components/merge-form-control-props';

export interface TextareaProps extends JSX.TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** Force callback ref */
	ref?: (el: HTMLTextAreaElement) => void;
}

export function Textarea(props: TextareaProps) {
	const rest = mergeFormControlProps(props);
	return <textarea {...rest} class={cx('c-textarea', props.class)} />;
}
