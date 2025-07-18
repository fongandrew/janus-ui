import {
	autoUpdate,
	computePosition,
	flip,
	type Middleware,
	type Placement,
	shift,
	size,
} from '@floating-ui/dom';

import {
	runAfterHideCallbacks,
	runBeforeShowCallbacks,
} from '~/lib/utility/callback-attrs/display';
import { createHandler } from '~/lib/utility/callback-attrs/events';
import { registerDocumentSetup } from '~/lib/utility/document-setup';
import { isTextInput } from '~/lib/utility/element-types';
import { isFocusVisible } from '~/lib/utility/is-focus-visible';
import { createMagicProp } from '~/lib/utility/magic-prop';
import { elmDoc, evtDoc } from '~/lib/utility/multi-view';
import { onUnmount } from '~/lib/utility/unmount-observer';

/** Magic attribute to signal popover is about to be positioned */
const POPOVER_ACTIVE_ATTR = 'data-c-dropdown__active';

/** Magic attribute to signal placement of popover as positioned */
const POPOVER_POSITION_ATTR = 'data-c-dropdown__position';

/** Track whether there's a floating UI clean up function for a popover */
const [cleanUpCallback, setCleanUpCallback] = createMagicProp<() => void>();

/** Set popover cleanup function */
export const setPopoverCleanUp = (popover: HTMLElement, cleanUp: () => void) => {
	setCleanUpCallback(popover, cleanUp);
	onUnmount(popover, cleanUpPopover);
};

/** Clean up observers associated with a popover */
export const cleanUpPopover = (popover: HTMLElement) => {
	const cleanUp = cleanUpCallback(popover);
	cleanUp?.();
	setCleanUpCallback(popover, undefined);
};

/** Magic prop to signal that we shouldn't select text on popover input on next open */
const [skipSelect, setSkipSelect] = createMagicProp<boolean>();
export { setSkipSelect };

/**
 * Handle menu blur / focus out closing the parent popover
 */
export const dropdownCloseOnBlur = createHandler('focusout', '$c-dropdown__focusout', (event) => {
	if (!isFocusVisible()) return;

	const relatedTarget = event.relatedTarget as HTMLElement | null;
	if (!relatedTarget) return;

	const target = event.target as HTMLElement;
	const popover = target.closest(':popover-open') as HTMLElement | null;
	if (!popover) return;

	if (popover.contains(relatedTarget)) return;
	popover.hidePopover();
});

/**
 * Close nearest popover
 */
export const dropdownClose = createHandler('click', '$c-dropdown__close', (event) => {
	const target = event.target as HTMLElement;
	const popover = target.closest(':popover-open') as HTMLElement | null;
	popover?.hidePopover();
});

/**
 * Position dropdown on open, set ARIA props, close other popovers
 */
export const dropdownBeforeToggleOpen = createHandler(
	'beforetoggle',
	'$c-dropdown__before-toggle-open',
	(event, placement?: Placement, fixedWidth?: 'fw') => {
		if ((event as ToggleEvent & { currentTarget: HTMLElement }).newState !== 'open') return;
		const target = event.target as HTMLElement;

		// Close other popovers when opening this one
		for (const popover of evtDoc(event)?.querySelectorAll(':popover-open') ?? []) {
			if (!popover.contains(target)) {
				(popover as HTMLElement).hidePopover();
			}
		}

		// Position the popover relative to trigger
		const trigger = getTrigger(target);
		if (!trigger) return;

		const opts = {
			placement,
			fixedWidth: !!fixedWidth,
		};
		updatePosition(trigger, target, opts);
		const cleanUp = autoUpdate(trigger, target, () => updatePosition(trigger, target, opts));
		setPopoverCleanUp(target, cleanUp);

		trigger.setAttribute('aria-expanded', 'true');
		runBeforeShowCallbacks(target);
	},
);

/** Run any cleanup callbacks after dropdown is closed */
export const dropdownToggleClosed = createHandler('toggle', '$c-dropdown__toggle-closed', ((
	event: ToggleEvent,
) => {
	if (event.newState !== 'closed') return;
	const target = event.target as HTMLElement;

	runAfterHideCallbacks(target);
	getTrigger(target)?.setAttribute('aria-expanded', 'false');
	cleanUpPopover(target);
}) as (event: Event) => void);

/** Update the position of an element given a trigger + dropdown */
const updatePosition = async (
	trigger: HTMLElement,
	popover: HTMLElement,
	opts?: {
		placement?: Placement | '' | undefined;
		fixedWidth?: boolean;
		middleware?: Middleware[];
	},
) => {
	if (!trigger.isConnected || !popover.isConnected) {
		cleanUpPopover(popover);
		return;
	}

	// Technically we're setting this before it's positioned but this also enables
	// the popover to be handle transitions correctly before it's visible
	popover.setAttribute(POPOVER_ACTIVE_ATTR, '');
	const { x, y, placement } = await computePosition(trigger, popover, {
		placement: opts?.placement || 'bottom-start',
		middleware: opts?.middleware ?? [
			flip({
				// Somewhat large padding for flip because dropdown content is resizable
				// (overflow: auto) and will technically "fit" in smaller spaces but look
				// really squished / require excessive scrolling
				padding: 100,
			}),
			shift({ padding: 4 }),
			size({
				apply({ rects, elements, availableWidth, availableHeight }) {
					if (opts?.fixedWidth) {
						elements.floating.style.setProperty(
							'--c-dropdown__computed-max-width',
							`${rects.reference.width}px`,
						);
					} else {
						elements.floating.style.setProperty(
							'--c-dropdown__computed-max-width',
							`${Math.max(0, availableWidth - 8)}px`,
						);
					}
					elements.floating.style.setProperty(
						'--c-dropdown__computed-min-width',
						`${rects.reference.width}px`,
					);
					elements.floating.style.setProperty(
						'--c-dropdown__computed-max-height',
						`${Math.max(0, availableHeight - 8)}px`,
					);
				},
			}),
		],
		strategy: 'fixed',
	});
	popover.style.setProperty('--c-dropdown__left', `${x}px`);
	popover.style.setProperty('--c-dropdown__top', `${y}px`);
	popover.setAttribute(POPOVER_POSITION_ATTR, placement);
};

function getTrigger(popover: HTMLElement) {
	return elmDoc(popover)?.querySelector<HTMLElement>(`[popovertarget="${popover.id}"]`);
}

registerDocumentSetup((document) => {
	const POPOVER_OPEN_ATTR = 'data-v-popover-open';

	//
	// On desktop, the sequence of events for light dismiss is something like: mousedown,
	// popover dismissed, mouseup, toggle. On mobile and touchscreen devices, the sequence
	// is touchstart, popover dismissed, touchend, mousedown, mouseup. This is a problem
	// because we use popover visibility to display a backdrop that blocks clicks. This
	// works fine on desktop because there the backdrop catches the mousedown. But on
	// mobile, the backdrop disappears after touchstart and the elements get a full
	// mousedown/mouseup and thus a click. This workaround ties to the backdrop to a
	// special data attribute in between touchstart and touchend to prevent this.
	//
	// Note that we still want to rely on `:popover-open` in the general case since
	// there are ways to toggle popovers without mouse or touch events. This is a
	// special case.
	//

	function removePopoverOpen() {
		for (const elm of document.querySelectorAll(`[${POPOVER_OPEN_ATTR}]`)) {
			elm.removeAttribute(POPOVER_OPEN_ATTR);
		}
	}

	document.addEventListener(
		'touchstart',
		function () {
			let setPopoverOpen = false;
			for (const elm of document.querySelectorAll(':popover-open')) {
				elm.setAttribute(POPOVER_OPEN_ATTR, '');
				setPopoverOpen = true;
			}
			if (setPopoverOpen) {
				document.body.addEventListener('mouseup', removePopoverOpen, {
					once: true,
				});
			}
		},
		true,
	);

	// This is needed to make light dismiss work prior to iOS 18.3
	document.addEventListener('pointerdown', function () {});

	/**
	 * The visibility transition messes with Safari focusing autofocus elements
	 * in popovers, so do manually.
	 *
	 * Also a chance to auto-select input values too
	 */
	document.addEventListener(
		'toggle',
		(event) => {
			if ((event as ToggleEvent).newState !== 'open') return;
			const popover = event.target as HTMLElement;
			const focusable = popover.querySelector<HTMLElement>('[autofocus]');
			focusable?.focus();
			if (focusable && skipSelect(focusable)) {
				setSkipSelect(focusable, false);
			} else if (isTextInput(focusable)) {
				focusable.select();
			}
		},
		{ capture: true },
	);
});
