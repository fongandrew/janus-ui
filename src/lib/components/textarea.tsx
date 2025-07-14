import cx from 'classix';

import { type FormElementProps, mergeFormElementProps } from '~/lib/components/form-element-props';

export interface TextareaProps extends Omit<FormElementProps<'textarea'>, 'type'> {}

/**
 * Multi-line text input component
 *
 * @example
 * ```tsx
 * // Basic textarea
 * 	<Textarea placeholder="Enter your message here..." />
 *
 * // With different states
 * 	<Textarea invalid placeholder="Error state textarea" />
 * 	<Textarea disabled placeholder="Disabled textarea" />
 *
 * // Inside a LabelledInput
 * 	<LabelledInput label="Message">
 * 		<Textarea placeholder="Enter your message..." />
 * 	</LabelledInput>
 * ```
 */
export function Textarea(props: TextareaProps) {
	const rest = mergeFormElementProps<'textarea'>(props);
	return <textarea {...rest} class={cx('c-textarea', props.class)} />;
}
