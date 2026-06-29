/**
 * `t-reset-on-close` — reset a form when its ancestor `<dialog>` closes (or
 * `[popover]` toggles closed) (§12.1). Driven by the form engine's capture-phase
 * close / toggle listeners; importing this module installs them.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { installFormEngine } from '~/lib2/dom/form/submit';

installFormEngine();

/** Producer: reset this form when its overlay closes. */
export function resetOnClose() {
	return { 'data-js': concat('t-reset-on-close') };
}
