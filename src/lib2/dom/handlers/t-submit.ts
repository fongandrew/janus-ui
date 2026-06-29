/**
 * `t-submit` — opt a form into async submit choreography (§12.1). Importing this
 * module installs the engine's document-level listeners.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { installFormEngine } from '~/lib2/dom/form/submit';

installFormEngine();

/** Producer: opt a form into managed submission. */
export function submits() {
	return { 'data-js': concat('t-submit') };
}
