/**
 * `t-validate` — opt a form into the validation engine (§12.1). Importing this
 * module installs the engine's document-level listeners.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { installFormEngine } from '~/lib2/dom/form/submit';

installFormEngine();

/** Producer: opt a form into client-side validation. */
export function validates() {
	return { 'data-js': concat('t-validate') };
}
