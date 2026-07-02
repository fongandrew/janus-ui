/**
 * c-drawer = native <dialog> + o-dialog chrome + edge-anchored CSS +
 * t-request-close (§12.3).
 */
import '~/lib2/dom/handlers/t-request-close';
import '~/lib2/dom/handlers/t-restore-focus';

import { concat } from '~/lib2/dom/compose-attrs';

export function drawer() {
	return {
		'data-js': concat('t-request-close t-restore-focus'),
	};
}
