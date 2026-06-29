/**
 * `c-popover` composition (§12.3): `[popover]` + `t-request-close`.
 */
import { requestClose } from '~/lib2/dom/handlers/t-request-close';

/** Attributes for a `[popover]` element anchored to `anchorId`. */
export function popover() {
	return requestClose();
}
