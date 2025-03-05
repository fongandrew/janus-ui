import { type JSX } from 'solid-js';

import {
	validateChildrenOnChange,
	validateTouchedChildrenOnChange,
} from '~/shared/handlers/validation';
import { handlerProps } from '~/shared/utility/event-handler-attrs';

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
			{...handlerProps(
				props.touchedOnly === false
					? validateChildrenOnChange
					: validateTouchedChildrenOnChange,
			)}
		/>
	);
}
