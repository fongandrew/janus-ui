import {
	autoPlacement,
	autoUpdate,
	computePosition,
	flip,
	type Middleware,
	offset,
	shift,
} from '@floating-ui/dom';
import { createEffect, createSignal, onCleanup } from 'solid-js';

import { generateId } from '~/shared/utility/id-generator';
import {
	createEventDelegate,
	type EventDelegateProps,
} from '~/shared/utility/solid/create-event-delegate';

const useBeforeToggle = createEventDelegate<
	'beforetoggle',
	{ setVisible: (open: boolean) => void }
>(
	'beforetoggle',
	(event) => {
		event.props.setVisible(
			(event as ToggleEvent & EventDelegateProps<{ setVisible: (open: boolean) => void }>)
				.newState === 'open',
		);
	},
	true,
);

const useClick = createEventDelegate('click', (event) => {
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
		offset(4),
		flip(),
		shift({ padding: 4 }),
		autoPlacement({
			allowedPlacements: ['bottom-start', 'bottom-end'],
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

		Object.assign(menuElm.style, {
			position: 'fixed',
			inset: 'unset', // Clear popover positioning
			left: `${x}px`,
			top: `${y}px`,
		});
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
	useClick(triggerElement);
	useKeydown(triggerElement);

	const setMenuElementAndInit = (el: HTMLElement) => {
		el.popover = '';
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
