/**
 * `c-popover` — `[popover]` + `t-request-close` (§12.3). Outside-click /
 * ESC dismissal is native light-dismiss for `popover="auto"`;
 * `t-request-close`'s `beforetoggle` hook lets a consumer cancel it.
 */

import { type AttrValue, ca, only } from '~/lib2/dom/compose-attrs';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';

/** Producer: opts a `[popover]` element into the popover behavior set. */
export function popover(): Record<string, AttrValue> {
	return ca(requestClose(), { popover: only('auto') });
}
