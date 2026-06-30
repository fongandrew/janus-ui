/**
 * `t-submit` — opts a `<form>` into the submit engine (§12.1). All dispatch
 * logic lives in `form/submit.ts`; see `t-validate.ts` for why the form
 * engine keeps its own listeners instead of the general dispatcher.
 */

import '~/lib2/dom/form/submit';
