import { createHandler } from '~/shared/utility/event-handler-attrs';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';

/**
 * Handle menu blur / focus out closing the parent popover
 */
export const dropdownCloseOnBlur = createHandler('focusout', 'dropdown__focus-out', (event) => {
	if (!isFocusVisible()) return;

	const relatedTarget = event.relatedTarget as HTMLElement | null;
	if (!relatedTarget) return;

	const target = event.target as HTMLElement;
	const popover = target.closest(':popover-open') as HTMLElement | null;
	if (!popover) return;

	if (popover.contains(relatedTarget)) return;
	popover.hidePopover();
});
