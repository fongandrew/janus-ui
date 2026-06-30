/**
 * `c-styled-select` — `[popover]` + `t-roving-focus` + `t-active-descendant`
 * + `t-typeahead-filter` (§12.3). The only composite component with
 * substantial wiring; the Solid wrapper (§13.7) layers form-engine
 * integration (validators, `data-validators`) on top of this token set.
 */

import { type AttrValue, ca, only } from '~/lib2/dom/compose-attrs';
import { activeDescendant } from '~/lib2/dom/handlers/t-active-descendant';
import { rovingFocus } from '~/lib2/dom/handlers/t-roving-focus';
import { typeaheadFilter } from '~/lib2/dom/handlers/t-typeahead-filter';

/** Producer: opts a `[popover]` listbox into the styled-select behavior set. */
export function styledSelect(): Record<string, AttrValue> {
	return ca(
		rovingFocus({ axis: 'vertical', homeEnd: true }),
		activeDescendant(),
		typeaheadFilter(),
		{
			role: only('listbox'),
			popover: only('auto'),
		},
	);
}
