import { createValidator } from '~/shared/callback-attrs/validation';
import { evtDoc } from '~/shared/utility/multi-view';

/** Validates that password element matches value in element */
export const matchesPassword = createValidator(
	'form-validation-group__matches',
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
