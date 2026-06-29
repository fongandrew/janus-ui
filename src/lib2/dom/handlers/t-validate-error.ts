/**
 * `t-validate-error` — mark an element as a field's error destination (§12.1). The
 * engine walks a field's `aria-describedby` to find the element carrying this token
 * and writes the error message there.
 */
import { concat } from '~/lib2/dom/compose-attrs';

/** Producer: mark an element as a validation error destination. */
export function validateError() {
	return { 'data-js': concat('t-validate-error') };
}
