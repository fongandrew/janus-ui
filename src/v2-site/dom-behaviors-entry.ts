/**
 * Client entry for the DOM behaviors doc page (Pattern A, §12.4): pulls in
 * every handler module and primes the dispatcher. Also registers the demo
 * page's one named submit handler -- a real consumer would do the same for
 * any named validators/handlers their static markup references.
 */
import '~/lib2/dom/all';

import { mount, registerSubmitHandler } from '~/lib2/dom';

registerSubmitHandler('dom-demo-signup', async () => {
	await new Promise((resolve) => setTimeout(resolve, 200));
	return { ok: true };
});

mount();
