import { createHandler } from '~/shared/utility/callback-attrs/events';
import { evtDoc } from '~/shared/utility/multi-view';

/** Toggles the visibility of the element identified with aria-controls */
export const toggle = createHandler('click', 'toggle', (event) => {
	const toggleBtn = event.currentTarget as HTMLElement;
	const targetId = toggleBtn.getAttribute('aria-controls');
	if (!targetId) return;

	const target = evtDoc(event)?.getElementById(targetId);
	if (!target) return;

	if (target.classList.contains('t-hidden')) {
		target.classList.remove('t-hidden');
		toggleBtn.setAttribute('aria-expanded', 'true');
	} else {
		target.classList.add('t-hidden');
		toggleBtn.setAttribute('aria-expanded', 'false');
	}
});
