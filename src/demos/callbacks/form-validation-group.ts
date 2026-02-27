import { createValidator } from '~/lib/utility/callback-attrs/validate';
import { evtDoc } from '~/lib/utility/multi-view';

/** Validates input value has no spaces */
export const validateUserNameNoSpaces = createValidator(
	'$p-form-validation-group__no-spaces',
	(event: Event & { currentTarget: HTMLInputElement }) => {
		const value = event.currentTarget.value;
		if (value.includes(' ')) {
			return 'Username cannot contain spaces';
		}
		return null;
	},
);

/** Validates that email input has a valid email format (realtime, on input) */
export const validateEmailFormat = createValidator(
	'$p-form-validation-group__email-format',
	(event: Event & { currentTarget: HTMLInputElement }) => {
		const value = event.currentTarget.value;
		if (!value) return null;
		// Basic email validation: must have text@text.text pattern
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
			return 'Please enter a valid email address';
		}
		return null;
	},
);

/** Validates that password element matches value in element */
export const matchesPassword = createValidator(
	'$p-form-validation-group__matches',
	(event: Event & { currentTarget: HTMLInputElement }, matchId) => {
		const matchElm = evtDoc(event)?.getElementById(matchId) as HTMLInputElement | null;
		const matchValue = matchElm?.value;
		if (!matchValue) return;

		const currentValue = event.currentTarget.value;
		if (!currentValue) return;

		if (currentValue !== matchValue) {
			return 'Passwords do not match';
		}
	},
);
