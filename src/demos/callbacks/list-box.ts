import { listBoxValues } from '~/shared/callback-attrs/list-box';
import { getList } from '~/shared/callback-attrs/option-list';
import { createValidator } from '~/shared/callback-attrs/validation';

export const listBoxNoRed = createValidator('list-box__no-red', (event) => {
	const listElm = getList(event.currentTarget);
	if (!listElm) return;
	const values = listBoxValues(listElm);
	if (values.has('red')) {
		return "Don't pick red.";
	}
});

export const listBoxMinMax = createValidator<HTMLElement, [string, string]>(
	'list-box__min-max',
	(minStr: string, maxStr: string, event) => {
		const target = event.currentTarget;
		const list = getList(target);
		if (!list) return;

		const values = listBoxValues(list);

		const min = parseInt(minStr, 10);
		if (!isNaN(min) && values.size < min) return `Select at least ${min} options`;

		const max = parseInt(maxStr, 10);
		if (!isNaN(max) && values.size > max) return `Select at most ${max} options`;

		return;
	},
);
