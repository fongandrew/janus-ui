/**
 * Client entry for the DOM behaviors page (v2-dom.html) — the Pattern A
 * consumer path (§12.4): import every handler, register app-level
 * validators/handlers, mount().
 */
import '~/lib2/dom/all';

import { mount, registerSubmitHandler, registerValidator } from '~/lib2/dom';

registerValidator('dom-no-bob', (el) =>
	el.value.toLowerCase().includes('bob') ? 'No Bobs allowed' : null,
);

registerSubmitHandler('dom-demo', (data, form) => {
	const output = form.querySelector('output');
	if (output) {
		output.textContent = `Submitted: ${String(data.get('email'))} / ${String(data.get('username'))}`;
	}
	return { ok: true };
});

mount();
