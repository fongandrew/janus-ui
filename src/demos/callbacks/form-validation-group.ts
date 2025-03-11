import { createValidator } from '~/shared/callback-attrs/validation';
import { data } from '~/shared/utility/magic-strings';
import { evtDoc } from '~/shared/utility/multi-view';

/** Validates that password element matches value in element */
export const matchesPassword = Object.assign(
	createValidator<HTMLInputElement>('form-validation-group__matches', (event) => {
		const matchId = event.currentTarget.getAttribute(matchesPassword.MATCH_ATTR);
		if (!matchId) return;

		const matchElm = evtDoc(event)?.getElementById(matchId) as HTMLInputElement | null;
		const matchValue = matchElm?.value;
		if (!matchValue) return;

		const currentValue = event.currentTarget.value;
		if (!currentValue) return;

		if (currentValue !== matchValue) {
			return 'Passwords do not match';
		}
	}),
	{
		MATCH_ATTR: data('form-validation-group__match'),
	},
);
