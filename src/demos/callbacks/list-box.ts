import { listBoxValues } from '~/shared/components/callbacks/list-box';
import { getList } from '~/shared/components/callbacks/option-list';
import { createValidator } from '~/shared/components/callbacks/validation';
import { createHandler } from '~/shared/utility/callback-attrs/events';

export const listBoxUpdateText = createHandler(
	'change',
	'list-box__update-text',
	(event, targetId: string) => {
		const listElm = getList(event.currentTarget);
		if (!listElm) return;

		const target = listElm.ownerDocument?.getElementById(targetId);
		if (!target) return;

		const values = listBoxValues(listElm);
		const text = `Selected: ${values.size ? Array.from(values).join(', ') : 'None'}`;
		target.textContent = text;
	},
);

export const listBoxNoRed = createValidator('list-box__no-red', (event) => {
	const listElm = getList(event.currentTarget);
	if (!listElm) return;
	const values = listBoxValues(listElm);
	if (values.has('red')) {
		return "Don't pick red.";
	}
});

export const listBoxMinMax = createValidator(
	'list-box__min-max',
	(event, minStr: string, maxStr: string) => {
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
