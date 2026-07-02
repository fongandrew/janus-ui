/**
 * t-validate-group — marker behavior on a <fieldset>: when one child
 * changes, every other touched child re-validates (§12.1). The logic lives
 * in t-validate's change handler; this registration keeps the token
 * resolvable for the dispatcher and the purge scanner.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

registerBehavior('t-validate-group', {});

export function validateGroup() {
	return { 'data-js': concat('t-validate-group') };
}
