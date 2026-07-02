/** c-popover (§12.3) = [popover] + t-request-close. */
import { ca } from '~/lib2/dom/compose-attrs';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';

export function popover() {
	return ca(requestClose());
}
