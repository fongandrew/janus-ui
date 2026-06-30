/**
 * `t-validate-group` — marks a `<fieldset>` whose touched members
 * re-validate each other on change (§12.1, cross-field constraints like
 * date ranges). The walk lives in `form/validate.ts`'s `change` listener;
 * this module just gives the SSR purge scan a target for the token.
 */

import '~/lib2/dom/form/validate';
