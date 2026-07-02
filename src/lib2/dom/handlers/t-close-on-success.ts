/**
 * t-close-on-success — on { ok: true } from the submit handler, close the
 * ancestor <dialog> / [popover] after reset (§12.1). The branch lives in
 * t-submit's choreography; this registration keeps the token resolvable.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

registerBehavior('t-close-on-success', {});

export function closeOnSuccess() {
	return { 'data-js': concat('t-close-on-success') };
}
