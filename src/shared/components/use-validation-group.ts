import {
	errorValidationMap,
	FORM_CONTROL_ATTR,
} from '~/shared/components/merge-form-control-props';
import { createEventDelegate } from '~/shared/utility/solid/create-event-delegate';

export interface ValidationGroupProps {
	/** Revalidate only if touched -- defaults to true */
	touchedOnly?: boolean;
}

/**
 * A validation group is some container that, if anything changes within, will force
 * revalidation of all other elements within it. Typical use case is something like
 * a password confirmation field that needs to revalidate if the password changes
 * (or vice versa), or a series of checkboxes with a max number of checked items.
 */
export const useValidationGroup = createEventDelegate<'change', ValidationGroupProps>(
	'change',
	(event) => {
		const { props } = event;
		for (const formControl of event.delegateTarget.querySelectorAll(`[${FORM_CONTROL_ATTR}]`)) {
			const errorValidationProps = errorValidationMap.get(formControl as HTMLElement);
			if (props.touchedOnly !== false && !errorValidationProps?.touched()) {
				continue;
			}
			errorValidationProps?.revalidate(event);
		}
	},
);
