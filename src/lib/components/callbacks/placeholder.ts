import { createMounter } from '~/lib/utility/callback-attrs/mount';
import { parseIntOrNull } from '~/lib/utility/parse';

export const PLACEHOLDER_DELAY_ATTR = 'data-delay';

export const placeholderDelayedShow = createMounter('$p-placeholder__delayed-show', async (el) => {
	el.classList.add('t-hidden');
	const delay = parseIntOrNull(el.getAttribute(PLACEHOLDER_DELAY_ATTR) ?? '0');
	if (delay && delay > 0) {
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
	el.classList.remove('t-hidden');
});

export const placeholderDelayedHide = createMounter('$p-placeholder__delayed-hide', async (el) => {
	el.classList.remove('t-hidden');
	const delay = parseIntOrNull(el.getAttribute(PLACEHOLDER_DELAY_ATTR) ?? '0');
	if (delay && delay > 0) {
		await new Promise((resolve) => setTimeout(resolve, delay));
	}
	el.classList.add('t-hidden');
});
