import { type ComponentProps } from 'solid-js';

import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import {
	validateChildrenOnChange,
	validateTouchedChildrenOnChange,
} from '~/lib/utility/callback-attrs/validate';

/**
 * Simple div wrapper to reuire that certain form controls validate together
 */
export interface FormValidationGroupProps extends ComponentProps<'div'> {
	/** Validate touched elements only (defaults to true) */
	touchedOnly?: boolean;
}

export function FormValidationGroup(props: FormValidationGroupProps) {
	return (
		<div
			{...props}
			{...callbackAttrs(
				props.touchedOnly === false
					? validateChildrenOnChange
					: validateTouchedChildrenOnChange,
			)}
		/>
	);
}
