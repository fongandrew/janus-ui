/**
 * c-modal = native <dialog> + t-request-close + t-restore-focus (§12.3).
 */
import '~/lib2/dom/handlers/t-request-close';
import '~/lib2/dom/handlers/t-restore-focus';
import '~/lib2/dom/handlers/t-scroll-shadow';

import { concat } from '~/lib2/dom/compose-attrs';

export function modal() {
	return {
		'data-js': concat('t-request-close t-restore-focus t-scroll-shadow'),
	};
}
