import { createHandler } from '~/shared/utility/event-handler-attrs';
import { elmDoc } from '~/shared/utility/multi-view';

/**
 * It is semantically incorrect to use `label` + `for` to describe non-input-like
 * elements (and we have a bunch of synthetic ones like Select), so we use
 * `aria-labelledby` with a `span` element instead. This handler focuses
 * the input element on click, mimicking the behavior of `for`.
 */
export const focusInputOnClick = createHandler('click', 'label__focus-input', (event) => {
	const labelLike = event.target as HTMLSpanElement;
	const document = elmDoc(labelLike);

	const input = document?.querySelector<HTMLInputElement>(`[aria-labelledby~="${labelLike.id}"]`);
	input?.focus();

	// Also show the popover if there is one
	const popoverTarget = input?.getAttribute('popovertarget');
	if (!popoverTarget) return;

	// Showing howing the popover in the same tick as a focus doesn't reliably work
	// for reasons not entirely clear to me
	setTimeout(() => {
		document.getElementById(popoverTarget)?.showPopover();
	}, 0);
});
