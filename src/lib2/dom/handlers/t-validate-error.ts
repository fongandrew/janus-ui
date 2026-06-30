/**
 * `t-validate-error` — marks the element a field's `aria-describedby`
 * points at as its error destination (§12.1). The engine walks the chain
 * and writes into the first matching element; this module just gives the
 * SSR purge scan a target for the token.
 */

import '~/lib2/dom/form/validate';
