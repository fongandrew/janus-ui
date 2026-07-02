/**
 * Client entry for the DOM-behaviors demo page (§5.T). This is the ONE
 * deliberate raw-HTML page in the Solid-authored site: it demonstrates and
 * E2E-tests the vanilla-JS consumer path with no framework in the loop
 * (Pattern A — import everything, then mount).
 */
import { mount, registerSubmitHandler } from '~/lib2/dom';
import '~/lib2/dom/all';

// A demo submit handler referenced by the form's data-submit-handler.
registerSubmitHandler('demo-signup', (data) => {
	const email = String(data.get('email') ?? '');
	if (email === 'taken@example.com') {
		return { ok: false, fieldErrors: { email: 'Already in use' } };
	}
	const output = document.getElementById('form-output');
	if (output) output.textContent = `Submitted: ${email}`;
	return { ok: true, reset: false };
});

mount();
