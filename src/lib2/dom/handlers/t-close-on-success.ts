/**
 * `t-close-on-success` — on a `{ ok: true }` submit result, close the
 * ancestor `<dialog>` (via `forceClose`, bypassing any request-close hook —
 * the data already saved, there's nothing left to confirm). The branch
 * lives in `form/submit.ts`'s dispatcher; this module just gives the SSR
 * purge scan a target for the token.
 */

import '~/lib2/dom/form/submit';
