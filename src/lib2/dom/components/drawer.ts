/**
 * `c-drawer` — native `<dialog>` + the same behavior set as `c-modal`
 * (§12.3). The edge-anchored chrome (`c-drawer--{side}`) is a CSS/Solid
 * concern; the DOM layer's wiring is identical to `modal()`.
 */

import { modal } from '~/lib2/dom/components/modal';
import { type AttrValue } from '~/lib2/dom/compose-attrs';

/** Producer: opts a `<dialog>` into the drawer behavior set. */
export function drawer(): Record<string, AttrValue> {
	return modal();
}
