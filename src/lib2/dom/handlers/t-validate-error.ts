/**
 * t-validate-error — marker behavior on an error destination element: the
 * engine walks a field's aria-describedby and writes the message into the
 * first element carrying this token, toggling role="alert" (§12.1).
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { registerBehavior } from '~/lib2/dom/dispatch';

registerBehavior('t-validate-error', {});

export function validateError() {
	return { 'data-js': concat('t-validate-error') };
}
