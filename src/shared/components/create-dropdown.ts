import {
	autoPlacement,
	autoUpdate,
	computePosition,
	flip,
	type Middleware,
	offset,
	shift,
	size,
} from '@floating-ui/dom';
import { createEffect, createSignal, onCleanup } from 'solid-js';

import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { generateId } from '~/shared/utility/id-generator';
import {
	createEventDelegate,
	type EventDelegateProps,
} from '~/shared/utility/solid/create-event-delegate';

const openDropdowns = new WeakMap<Document, Set<HTMLElement>>();

registerDocumentSetup((document) => {
	openDropdowns.set(document, new Set());

	document.addEventListener('click', (event) => {
		if (openDropdowns.get(document)?.size === 0) return;

		const target = event.target as HTMLElement | null;

		// This will land either on the popover itself (if click is inside
		// the popover) or the nearest containing context (if outside)
		const nearestRoot = target?.closest(':popover-open, :modal, body');
		if (!nearestRoot) return;

		// Closing all popovers within the nearest root effectively closes
		// popovers when clicking outside of them (and respects popovers
		// opened from inside modals + nested popovers)
		let didHide = false;
		for (const dropdown of openDropdowns.get(document) ?? []) {
			if (nearestRoot.contains(dropdown)) {
				dropdown.hidePopover();
				didHide = true;
			}
		}

		// Stop propagation and prevent default if we hid a popover to prevent
		// clicks from going 'through' a backdrop and interacting with elements
		if (didHide) {
			event.stopPropagation();
			event.preventDefault();
		}
	});

	document.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') return;

		// Hide the last popover only (in practice should be only one popover
		// dropdown open at a time)
		let dropdown;
		for (dropdown of openDropdowns.get(document) ?? []);
		if (dropdown) {
			dropdown.hidePopover();
			event.preventDefault();
		}
	});
});

const useBeforeToggle = createEventDelegate<
	'beforetoggle',
	{ setVisible: (open: boolean) => void }
>(
	'beforetoggle',
	(event) => {
		const document = event.target.ownerDocument;
		const typedEvent = event as ToggleEvent &
			EventDelegateProps<{ setVisible: (open: boolean) => void }>;
		if (typedEvent.newState === 'open') {
			// Close any other open dropdowns
			for (const openDropdown of openDropdowns.get(document) ?? []) {
				if (openDropdown !== typedEvent.target) {
					openDropdown.hidePopover();
				}
			}
			openDropdowns.get(document)?.add(typedEvent.target);
		} else {
			openDropdowns.get(document)?.delete(typedEvent.target);
		}
		typedEvent.props.setVisible(typedEvent.newState === 'open');
	},
	true,
);

const useTriggerClick = createEventDelegate('click', (event) => {
	// Open popover target. This shouldn't be necessary but popover does not open
	// on non-button elements.
	const targetId = event.target.getAttribute('popovertarget');
	if (targetId) {
		const target = document.getElementById(targetId);
		if (target) {
			target.togglePopover();
			event.preventDefault();
		}
	}
});

const useKeydown = createEventDelegate('keydown', (event) => {
	const target = event.target;

	// Down to open dropdowns
	if (
		event.key === 'ArrowDown' &&
		(target.ariaHasPopup === 'menu' || target.ariaHasPopup === 'listbox') &&
		target.ariaExpanded !== 'true'
	) {
		target.click();
		// To prevent scrolling the page
		event.preventDefault();
	}
});

export function createDropdown(
	middleware: Middleware[] = [
		autoPlacement({
			allowedPlacements: ['bottom-start', 'bottom-end'],
		}),
		offset(4),
		flip(),
		shift({ padding: 4 }),
		size({
			apply({ elements, availableWidth, availableHeight }) {
				elements.floating.style.setProperty(
					'--c-dropdown-max-width',
					`${Math.max(0, availableWidth - 8)}px`,
				);
				elements.floating.style.setProperty(
					'--c-dropdown-max-height',
					`${Math.max(0, availableHeight - 8)}px`,
				);
			},
		}),
	],
) {
	const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null);
	const [menuElement, setMenuElement] = createSignal<HTMLElement | null>(null);
	const [visible, setVisible] = createSignal(false);

	// Callback for updating position
	const updatePosition = async (triggerElm: HTMLElement, menuElm: HTMLElement) => {
		const { x, y } = await computePosition(triggerElm, menuElm, {
			placement: 'bottom',
			middleware,
			strategy: 'fixed',
		});

		menuElm.style.setProperty('--c-dropdown-left', `${x}px`);
		menuElm.style.setProperty('--c-dropdown-top', `${y}px`);
	};

	// Update display and positioning on visibility change
	createEffect(() => {
		const triggerElm = triggerElement();
		if (!triggerElm) return;

		const menuElm = menuElement();
		if (!menuElm) return;

		// Update ARIA visiblity
		triggerElm.ariaExpanded = visible() ? 'true' : 'false';

		// No need to do anything if not visible. Popover API should hide automatically.
		if (!visible()) {
			return;
		}

		// Menu is visible. Do initial position update, then update automatically when
		// scroll or resize events occur.
		updatePosition(triggerElm, menuElm);
		const cleanup = autoUpdate(triggerElm, menuElm, () => updatePosition(triggerElm, menuElm));
		onCleanup(cleanup);
	});

	// Assign ARIA attributes when both elements referenced
	createEffect(() => {
		const triggerElm = triggerElement();
		if (!triggerElm) return;

		const menuElm = menuElement();
		if (!menuElm) return;

		let menuId = menuElm.id;
		if (!menuId) {
			menuId = generateId('menu');
			menuElm.id = menuId;
		}

		let triggerId = triggerElm.id;
		if (!triggerId) {
			triggerId = generateId('trigger');
			triggerElm.id = triggerId;
		}

		if (!triggerElm.ariaHasPopup) {
			triggerElm.ariaHasPopup = 'menu';
		}
		triggerElm.setAttribute('popovertarget', menuId);
		menuElm.setAttribute('aria-labelledby', triggerId);
	});

	useBeforeToggle(menuElement, { setVisible });
	useTriggerClick(triggerElement);
	useKeydown(triggerElement);

	const setMenuElementAndInit = (el: HTMLElement) => {
		// The "light dismiss" with popover="auto" is a little buggy:
		// - They don't on iOS Safari as of 18.3 (https://caniuse.com/?search=popover)
		// - We can't block clicks through a backdrop element on Chrome Android (even if backdrop
		//   is manually created -- we can't block clicks at all with the built-in backdrop),
		//   although this is arguably correct and it's desktop that's wrong? Basically we use the
		//   :popover-open CSS selector to display the backdrop, so if the backdrop disappears
		//   as a result of the light dismiss but before the click fully resolves, the click
		//   might "complete" on an element underneath the backdrop.
		//
		// So we're going to use a manual popover for now. This means we need to dismissal when
		// clicks outside a popover happen (or if "esc" is pressed).
		el.popover = 'manual';
		setMenuElement(el);
	};

	return [
		setTriggerElement,
		setMenuElementAndInit,
		{
			getVisible: visible,
			setVisible,
			getTriggerNode: triggerElement,
			getMenuNode: menuElement,
			hidePopover: () => menuElement()?.hidePopover(),
		},
	] as const;
}
