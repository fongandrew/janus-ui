import { createHandler } from '~/shared/utility/callback-attrs/events';
import { focusAndSelect } from '~/shared/utility/focus-and-select';
import { firstFocusable } from '~/shared/utility/focusables';
import { elmDoc } from '~/shared/utility/multi-view';

/**
 * It is semantically incorrect to use `label` + `for` to describe non-input-like
 * elements (and we have a bunch of synthetic ones like Select), so we use
 * `aria-labelledby` with a `span` element instead. This handler focuses
 * the input element on click, mimicking the behavior of `for`.
 */
export const focusInputOnClick = createHandler('click', '$c-label__focus-input', (event) => {
	const labelLike = event.currentTarget as HTMLSpanElement;
	const document = elmDoc(labelLike);

	const input = document?.querySelector<HTMLInputElement>(`[aria-labelledby~="${labelLike.id}"]`);
	clickAndFocus(input);
});

/**
 * Similar but for groups (where there are multiple candidates so just pick the first focusable)
 */
export const focusGroupOnClick = createHandler('click', '$c-label__focus-group', (event) => {
	const labelLike = event.currentTarget as HTMLSpanElement;
	const document = elmDoc(labelLike);

	const group = document?.querySelector<HTMLInputElement>(`[aria-labelledby~="${labelLike.id}"]`);
	if (!group) return;

	const input = firstFocusable(group);
	clickAndFocus(input);
});

/** Helper to focus and do a bunch of other special stuff */
function clickAndFocus(input: HTMLElement | null) {
	if (!input) return;

	input.click();

	// Clicking should auto-focus a text input but it doesn't always?
	focusAndSelect(input);

	// Likewise, it should also show popover, but this doesn't reliably happen in tests,
	// so manually show the popover if there is one
	const popoverTarget = input?.getAttribute('popovertarget');
	if (!popoverTarget) return;

	// Showing howing the popover in the same tick as a focus doesn't reliably work
	// for reasons not entirely clear to me
	setTimeout(() => {
		elmDoc(input)?.getElementById(popoverTarget)?.showPopover();
	}, 0);
}
