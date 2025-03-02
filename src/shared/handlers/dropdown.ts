import {
	autoUpdate,
	computePosition,
	flip,
	type Middleware,
	offset,
	type Placement,
	shift,
	size,
} from '@floating-ui/dom';

import { attrIsTruthy } from '~/shared/utility/attribute';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { createHandler } from '~/shared/utility/event-handler-attrs';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { createMagicProp } from '~/shared/utility/magic-prop';
import { data } from '~/shared/utility/magic-strings';
import { evtDoc } from '~/shared/utility/multi-view';
import { parseIntOrNull } from '~/shared/utility/parse';

const [popoverCleanup, setPopoverCleanup] = createMagicProp<() => void>();

/**
 * Handle menu blur / focus out closing the parent popover
 */
export const dropdownCloseOnBlur = createHandler('focusout', 'dropdown__focusout', (event) => {
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
export const dropdownClose = createHandler('click', 'dropdown__close', (event) => {
	const target = event.target as HTMLElement;
	const popover = target.closest(':popover-open') as HTMLElement | null;
	popover?.hidePopover();
});

/**
 * Position dropdown on open, set ARIA props, close other popovers
 */
export const dropdownBeforeToggle = Object.assign(
	createHandler('beforetoggle', 'dropdown__before-toggle', ((event: ToggleEvent) => {
		const target = event.target as HTMLElement;

		// Close other popovers when opening this one
		if (event.newState === 'open') {
			for (const popover of evtDoc(event)?.querySelectorAll(':popover-open') ?? []) {
				if (!popover.contains(target)) {
					(popover as HTMLElement).hidePopover();
				}
			}
		}

		// Position the popover relative to trigger
		const trigger = evtDoc(event)?.querySelector<HTMLElement>(`[popovertarget="${target.id}"]`);
		if (!trigger) return;
		if (event.newState === 'open') {
			updatePosition(trigger, target);
			setPopoverCleanup(
				target,
				autoUpdate(trigger, target, () => updatePosition(trigger, target)),
			);
		} else {
			const cleanUp = popoverCleanup(target);
			cleanUp?.();
		}

		trigger.setAttribute('aria-expanded', event.newState === 'open' ? 'true' : 'false');
	}) as (event: Event) => void),
	{
		FIXED_WIDTH_ATTR: data('dropdown__fixed-width'),
		OFFSET_ATTR: data('dropdown__offset'),
		PLACEMENT_ATTR: data('dropdown__placement'),
	},
);

/** Update the position of an element given a trigger + dropdown */
const updatePosition = async (
	trigger: HTMLElement,
	popover: HTMLElement,
	opts?: {
		placement?: Placement;
		middleware?: Middleware[];
	},
) => {
	if (!trigger.isConnected || !popover.isConnected) {
		const cleanUp = popoverCleanup(popover);
		cleanUp?.();
		return;
	}

	const { x, y } = await computePosition(trigger, popover, {
		placement:
			opts?.placement ??
			(trigger.getAttribute(dropdownBeforeToggle.PLACEMENT_ATTR) as Placement) ??
			'bottom-start',
		middleware: opts?.middleware ?? [
			offset(parseIntOrNull(trigger.getAttribute(dropdownBeforeToggle.OFFSET_ATTR)) ?? 4),
			flip({
				// Somewhat large padding for flip because dropdown content is resizable
				// (overflow: auto) and will technically "fit" in smaller spaces but look
				// really squished / require excessive scrolling
				padding: 100,
			}),
			shift({ padding: 4 }),
			size({
				apply({ rects, elements, availableWidth, availableHeight }) {
					if (attrIsTruthy(trigger, dropdownBeforeToggle.FIXED_WIDTH_ATTR)) {
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
};

registerDocumentSetup((document) => {
	const POPOVER_OPEN_ATTR = data('popover-open');

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
});
