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
