/** c-drawer (§12.3) = native <dialog> + t-request-close + t-restore-focus. */
import { ca } from '~/lib2/dom/compose-attrs';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';
import { restoreFocus } from '~/lib2/dom/handlers/t-restore-focus';

export function drawer() {
	return ca(requestClose(), restoreFocus());
}
