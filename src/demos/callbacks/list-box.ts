import { listBoxValues } from '~/shared/components/callbacks/list-box';
import { getList } from '~/shared/components/callbacks/option-list';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import { createValidator } from '~/shared/utility/callback-attrs/validate';

export const listBoxUpdateText = createHandler(
	'change',
	'$p-list-box__update-text',
	(event, targetId: string) => {
		const listElm = getList(event.target as HTMLElement);
		if (!listElm) return;

		const target = listElm.ownerDocument?.getElementById(targetId);
		if (!target) return;

		const values = listBoxValues(listElm);
		const text = `Selected: ${values.size ? Array.from(values).join(', ') : 'None'}`;
		target.textContent = text;
	},
);

export const listBoxNoRed = createValidator('$p-list-box__no-red', (event) => {
	const listElm = getList(event.target as HTMLElement);
	if (!listElm) return;
	const values = listBoxValues(listElm);
	if (values.has('red')) {
		return "Don't pick red.";
	}
});

export const listBoxMinMax = createValidator(
	'$p-list-box__min-max',
	(event, minStr: string, maxStr: string) => {
		const list = getList(event.target as HTMLElement);
		if (!list) return;

		const values = listBoxValues(list);

		const min = parseInt(minStr, 10);
		if (!isNaN(min) && values.size < min) return `Select at least ${min} options`;

		const max = parseInt(maxStr, 10);
		if (!isNaN(max) && values.size > max) return `Select at most ${max} options`;

		return;
	},
);
