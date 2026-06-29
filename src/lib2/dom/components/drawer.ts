/**
 * `c-drawer` composition (§12.3): edge-anchored `<dialog>` + `t-request-close` +
 * `t-restore-focus`.
 */
import { ca } from '~/lib2/dom/compose-attrs';
import { requestClose } from '~/lib2/dom/handlers/t-request-close';
import { restoreFocus } from '~/lib2/dom/handlers/t-restore-focus';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

/** Attributes for a `<dialog class="c-drawer o-dialog c-drawer--{side}">`. */
export function drawer(side: DrawerSide) {
	return ca(requestClose(), restoreFocus(), { class: `c-drawer--${side}` });
}
