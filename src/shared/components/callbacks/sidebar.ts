import { callbackSelector } from '~/shared/utility/callback-attrs/callback-registry';
import { createHandler } from '~/shared/utility/callback-attrs/events';
import {
	runAfterHideCallbacks,
	runBeforeShowCallbacks,
} from '~/shared/utility/callback-attrs/visibility';
import { firstFocusable } from '~/shared/utility/focusables';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { elmDoc } from '~/shared/utility/multi-view';

/**
 * Magic data attribute for sidebar layout state. Values should `"true"`` or `"false"`
 * (empty string is considered the null or default state). This should go on the
 * sidebar element itself.
 */
export const SIDEBAR_STATE_ATTR = 'data-c-sidebar__state';

/**
 * We want to close the sidebar on narrow widths when focus leaves it but only if focus was
 * previously visible (that is, focus is shifting via keypress rather than mouse click).
 */
export const sidebarFocusOut = createHandler('focusout', '$c-sidebar__focus-out', (event) => {
	const sidebar = event.currentTarget;

	if (
		sidebar.getAttribute(SIDEBAR_STATE_ATTR) === 'open' &&
		!sidebar.contains(event.relatedTarget as Node) &&
		isFocusVisible()
	) {
		// Empty string will close sidebar on narrow mobile widths but leave it in its
		// default open state on wide desktop widths
		sidebar.setAttribute(SIDEBAR_STATE_ATTR, '');

		// aria-expanded state should be false because these buttons only show up on
		// mobile widths (in which case the sidebar is closed)
		const openButtons = getOpenButtons(sidebar);
		for (const button of openButtons) {
			if (button?.hasAttribute('aria-expanded')) {
				button.setAttribute('aria-expanded', 'false');
			}
		}
	}
});

/**
 * Close sidebar on escape key
 */
export const sidebarEscape = createHandler('keydown', '$c-sidebar__escape', (event) => {
	if (event.key === 'Escape') {
		closeSidebar(event.currentTarget);
	}
});

/**
 * Click handler to show sidebar
 */
export const sidebarTriggerOpen = createHandler('click', '$c-sidebar__open', (event) => {
	const sidebar = getSidebarFromTrigger(event.currentTarget);
	if (sidebar) {
		openSidebar(sidebar);
	}
});

/**
 * Click handler to hide sidebar
 */
export const sidebarTriggerClose = createHandler('click', '$c-sidebar__close', (event) => {
	const sidebar = getSidebarFromTrigger(event.currentTarget);
	if (sidebar) {
		closeSidebar(sidebar);
	}
});

function openSidebar(sidebar: HTMLElement) {
	runBeforeShowCallbacks(sidebar);
	sidebar.setAttribute(SIDEBAR_STATE_ATTR, 'open');

	for (const button of getOpenButtons(sidebar)) {
		if (button?.hasAttribute('aria-expanded')) {
			button.setAttribute('aria-expanded', 'true');
		}
	}

	firstFocusable(sidebar)?.focus();
}

function closeSidebar(sidebar: HTMLElement) {
	sidebar.setAttribute(SIDEBAR_STATE_ATTR, 'closed');
	runAfterHideCallbacks(sidebar);

	const sidebarId = sidebar.id;
	if (!sidebarId) return;

	const openButtons = getOpenButtons(sidebar);
	for (const button of openButtons) {
		if (button?.hasAttribute('aria-expanded')) {
			button.setAttribute('aria-expanded', 'false');
		}
	}
	openButtons[0]?.focus();
}

function getSidebarFromTrigger(trigger: HTMLElement) {
	const sidebarId = trigger.getAttribute('aria-controls');
	return (
		(sidebarId && elmDoc(trigger)?.getElementById(sidebarId)) ||
		trigger.closest<HTMLElement>(`[${SIDEBAR_STATE_ATTR}]`)
	);
}

function getOpenButtons(sidebar: HTMLElement) {
	const sidebarId = sidebar.id;
	if (!sidebarId) return [];

	return (
		elmDoc(sidebar)?.querySelectorAll<HTMLElement>(
			`${callbackSelector(sidebarTriggerOpen)}[aria-controls="${sidebarId}"]`,
		) ?? []
	);
}
