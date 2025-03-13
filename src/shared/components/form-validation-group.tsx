import { type JSX } from 'solid-js';

import {
	validateChildrenOnChange,
	validateTouchedChildrenOnChange,
} from '~/shared/components/callbacks/validation';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

/**
 * Simple div wrapper to reuire that certain form controls validate together
 */
export interface FormValidationGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
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
