/**
 * `t-validate-group` — cross-field validation grouping (§12.1). When a child of a
 * tagged fieldset changes, every other touched child re-validates. Behavior is
 * driven by the form engine; importing this module installs its listeners.
 */
import { concat } from '~/lib2/dom/compose-attrs';
import { installFormEngine } from '~/lib2/dom/form/submit';

installFormEngine();

/** Producer: group fields for cross-field re-validation. */
export function validateGroup() {
	return { 'data-js': concat('t-validate-group') };
}
