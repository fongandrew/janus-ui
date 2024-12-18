import {
	autoPlacement,
	autoUpdate,
	computePosition,
	flip,
	type Middleware,
	offset,
	type Placement,
	shift,
} from '@floating-ui/dom';
import { createEffect, createSignal, onCleanup } from 'solid-js';

import { generateId } from '~/shared/utility/id-generator';

export const DROPDOWN_TRIGGER_ATTR = 'data-dropdown-trigger';

/** Track which documents have our delegated handler on them */
const didAttachToDocument = new WeakSet<Document>();

/** Map from trigger to signal setter for delegated handler */
const menuMap = new Map<HTMLElement, (open: boolean) => void>();

function handleToggleEvent(event: Event) {
	const target = event.target as HTMLElement;
	if (!target) return;
	menuMap.get(target)?.((event as ToggleEvent).newState === 'open');
}

function attachToDocument(targetDocument = window.document) {
	if (didAttachToDocument.has(targetDocument)) {
		return;
	}
	targetDocument.addEventListener('beforetoggle', handleToggleEvent, true);
	didAttachToDocument.add(targetDocument);
}

export function createDropdown(
	defaultPlacements: Placement | Placement[] = ['bottom-start', 'bottom-end'],
) {
	const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null);
	const [menuElement, setMenuElement] = createSignal<HTMLElement | null>(null);
	const [visible, setVisible] = createSignal(false);

	// Callback for updating position
	const updatePosition = async (triggerElm: HTMLElement, menuElm: HTMLElement) => {
		const middleware: Middleware[] = [offset(8), flip(), shift({ padding: 8 })];
		if (Array.isArray(defaultPlacements)) {
			middleware.unshift(
				autoPlacement({
					allowedPlacements: defaultPlacements,
				}),
			);
		}

		const { x, y } = await computePosition(triggerElm, menuElm, {
			...(typeof defaultPlacements === 'string'
				? { placement: defaultPlacements }
				: undefined),
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

		// Hide menu when not visible
		if (!visible()) {
			return;
		}

		// Menu is visible. Do initial position update
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

		triggerElm.setAttribute('aria-haspopup', 'true');
		triggerElm.setAttribute('popovertarget', menuId);
		menuElm.setAttribute('aria-labelledby', triggerId);
	});

	const setTriggerElementAndInit = (el: HTMLElement) => {
		el.setAttribute(DROPDOWN_TRIGGER_ATTR, '');
		setTriggerElement(el);
	};

	const setMenuElementAndInit = (el: HTMLElement) => {
		menuMap.set(el, setVisible);
		onCleanup(() => {
			menuMap.delete(el);
		});

		el.popover = '';
		setMenuElement(el);
		attachToDocument();
	};

	return [setTriggerElementAndInit, setMenuElementAndInit] as const;
}
