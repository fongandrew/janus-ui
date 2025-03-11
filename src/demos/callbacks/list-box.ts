import { listBoxValues } from '~/shared/callback-attrs/list-box';
import { getList } from '~/shared/callback-attrs/option-list';
import { createValidator } from '~/shared/callback-attrs/validation';
import { data } from '~/shared/utility/magic-strings';
import { parseIntOrNull } from '~/shared/utility/parse';

export const listBoxNoRed = createValidator('list-box__no-red', (event) => {
	const listElm = getList(event.currentTarget);
	if (!listElm) return;
	const values = listBoxValues(listElm);
	if (values.has('red')) {
		return "Don't pick red.";
	}
});

export const listBoxMinMax = Object.assign(
	createValidator('list-box__min-max', (event) => {
		const target = event.currentTarget;
		const list = getList(target);
		if (!list) return;

		const values = listBoxValues(list);

		const min = parseIntOrNull(target.getAttribute(listBoxMinMax.MIN_ATTR));
		if (min && values.size < min) return `Select at least ${min} options`;

		const max = parseIntOrNull(target.getAttribute(listBoxMinMax.MAX_ATTR));
		if (max && values.size > max) return `Select at most ${max} options`;

		return;
	}),
	{
		MIN_ATTR: data('select-validation__min'),
		MAX_ATTR: data('select-validation__max'),
	},
);
