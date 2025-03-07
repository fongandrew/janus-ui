import { callbackSelector } from '~/shared/utility/callback-registry';
import { createHandler } from '~/shared/utility/event-handler-attrs';
import { firstFocusable } from '~/shared/utility/focusables';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { data } from '~/shared/utility/magic-strings';
import { elmDoc } from '~/shared/utility/multi-view';

/**
 * Magic data attribute for sidebar layout state. Values should `"true"`` or `"false"`
 * (empty string is considered the null or default state)
 */
export const SIDEBAR_STATE_ATTR = data('sidebar__state');

/**
 * We want to close the sidebar on narrow widths when focus leaves it but only if focus was
 * previously visible (that is, focus is shifting via keypress rather than mouse click).
 */
export const sidebarFocusOut = createHandler('focusout', 'sidebar__focus-out', (event) => {
	const stateElm = (event.target as HTMLElement).closest(`[${SIDEBAR_STATE_ATTR}]`);
	if (!stateElm) return;

	if (
		stateElm.getAttribute(SIDEBAR_STATE_ATTR) === 'true' &&
		event.currentTarget.contains(event.relatedTarget as Node) &&
		isFocusVisible()
	) {
		// Empty string will close sidebar on narrow mobile widths but leave it in its
		// default open state on wide desktop widths
		stateElm.setAttribute(SIDEBAR_STATE_ATTR, '');
	}
});

/**
 * Close sidebar on escape key
 */
export const sidebarEscape = createHandler('keydown', 'sidebar__escape', (event) => {
	if (event.key === 'Escape') {
		sidebarClose.do(event);
	}
});

/**
 * Click handler to show sidebar
 */
export const sidebarOpen = createHandler('click', 'sidebar__open', (event) => {
	const target = event.target as HTMLElement;

	const stateElm = target.closest(`[${SIDEBAR_STATE_ATTR}]`);
	stateElm?.setAttribute(SIDEBAR_STATE_ATTR, 'open');

	if (target.hasAttribute('aria-expanded')) {
		target.setAttribute('aria-expanded', 'true');
	}

	// Focus on first focusable element in sidebar
	const sidebar = elmDoc(stateElm as HTMLElement)?.querySelector<HTMLElement>(
		callbackSelector(sidebarFocusOut),
	);
	if (!sidebar) return;
	firstFocusable(sidebar)?.focus();
});

/**
 * Click handler to hide sidebar
 */
export const sidebarClose = createHandler('click', 'sidebar__close', (event) => {
	const stateElm = (event.target as HTMLElement).closest(`[${SIDEBAR_STATE_ATTR}]`);
	if (!stateElm) return;

	stateElm.setAttribute(SIDEBAR_STATE_ATTR, 'closed');

	const openButtons = elmDoc(stateElm as HTMLElement)?.querySelectorAll<HTMLElement>(
		callbackSelector(sidebarOpen),
	);
	for (const button of openButtons) {
		if (button?.hasAttribute('aria-expanded')) {
			button.setAttribute('aria-expanded', 'false');
		}
	}
	openButtons[0]?.focus();
});
