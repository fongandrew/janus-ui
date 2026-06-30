/**
 * `t-validate` — opts a `<form>` into the validation engine (§12.1). All
 * dispatch logic lives in `form/validate.ts`, which keeps its own
 * document-level `change`/`input` listeners rather than going through the
 * general per-ancestor dispatcher (the form lifecycle doesn't fit that
 * shape). This module exists so the SSR purge scan (§12.4) has a
 * filename-as-manifest target for the `t-validate` token.
 */

import '~/lib2/dom/form/validate';
