import cx from 'classix';
import { type ComponentProps } from 'solid-js';

import { FORM_CONTROL_ERROR_ATTR } from '~/lib/utility/callback-attrs/validate';

export interface ErrorMessageProps extends ComponentProps<'div'> {
	/** ID required for linking to input */
	id: string;
}

/**
 * Displays error message for this input group if any
 */
export function ErrorMessage(props: ErrorMessageProps) {
	return (
		<div
			role={props.children ? 'alert' : undefined}
			aria-atomic="true"
			{...{ [FORM_CONTROL_ERROR_ATTR]: '' }}
			{...props}
			class={cx('c-error-message', props.class)}
		>
			{props.children}
		</div>
	);
}
