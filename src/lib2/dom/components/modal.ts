/**
 * `c-modal` — native `<dialog>` + `t-request-close` + `t-restore-focus`
 * (§12.3). Focus trapping is native to `<dialog>`, so no `t-focus-trap`.
 */

import { type AttrValue, ca } from '~/lib2/dom/compose-attrs';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';
import { restoreFocus } from '~/lib2/dom/handlers/t-restore-focus';

/** Producer: opts a `<dialog>` into the modal behavior set. */
export function modal(): Record<string, AttrValue> {
	return ca(requestClose(), restoreFocus());
}
