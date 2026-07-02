/** c-tabs (§12.3) = roving focus (horizontal) + aria-selected/panel sync. */
import { ca } from '~/lib2/dom/compose-attrs';
import { tabsSelect } from '~/lib2/dom/handlers/c-tabs__select';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';

export function tabList() {
	return ca({ role: 'tablist' }, rovingFocus({ axis: 'horizontal' }), tabsSelect());
}
