/**
 * `t-close-on-success` — close the ancestor overlay after a successful submit
 * (§12.1). Driven by the form engine's submit dispatcher; importing this module
 * installs its listeners.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { installFormEngine } from '~/lib2/dom/form/submit';

installFormEngine();

/** Producer: close this form's overlay on submit success. */
export function closeOnSuccess() {
	return { 'data-js': concat('t-close-on-success') };
}
