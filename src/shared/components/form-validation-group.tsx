import { createSignal, type JSX } from 'solid-js';

import {
	useValidationGroup,
	type ValidationGroupProps,
} from '~/shared/components/use-validation-group';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

/**
 * Simple div wrapper to reuire that certain form controls validate together
 */
export interface FormValidationGroupProps
	extends ValidationGroupProps,
		JSX.HTMLAttributes<HTMLDivElement> {
	/** Force ref to be callback, if any */
	ref?: (element: HTMLDivElement) => void;
}

export function FormValidationGroup(props: FormValidationGroupProps) {
	const [validationGroup, setValidationGroup] = createSignal<HTMLDivElement | null>(null);
	useValidationGroup(validationGroup, props);
	return <div ref={combineRefs(setValidationGroup, props.ref)} {...props} />;
}
