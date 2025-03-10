import cx from 'classix';
import { type JSX } from 'solid-js';

import { FORM_CONTROL_ERROR_ATTR } from '~/shared/callback-attrs/validation';

export interface ErrorMessageProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ID required for linking to input */
	id: string;
}

/**
 * Displays error message for this input group if any
 */
export function ErrorMessage(props: ErrorMessageProps) {
	return (
		<div
			role="alert"
			aria-atomic="true"
			{...{ [FORM_CONTROL_ERROR_ATTR]: '' }}
			{...props}
			class={cx('c-error-message', props.class)}
		>
			{props.children}
		</div>
	);
}
