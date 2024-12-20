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

/** Track which documents have our delegated handler on them */
const didAttachToDocument = new WeakSet<Document>();

/** Map from trigger to signal setter for delegated handler */
const menuMap = new Map<HTMLElement, (open: boolean) => void>();

function handleToggleEvent(event: Event) {
	const target = event.target as HTMLElement;
	if (!target) return;
	menuMap.get(target)?.((event as ToggleEvent).newState === 'open');
}

function handleKeyDownEvent(event: KeyboardEvent) {
	const target = event.target as HTMLElement;
	if (!target) return;

	// Down to open dropdowns
	if (
		event.key === 'ArrowDown' &&
		(target.ariaHasPopup === 'menu' || target.ariaHasPopup === 'listbox')
	) {
		target.click();
		// To prevent scrolling the page
		event.preventDefault();
	}
}

function attachToDocument(targetDocument = window.document) {
	if (didAttachToDocument.has(targetDocument)) {
		return;
	}
	targetDocument.addEventListener('beforetoggle', handleToggleEvent, true);
	targetDocument.addEventListener('keydown', handleKeyDownEvent);
	didAttachToDocument.add(targetDocument);
}

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

	const setTriggerElementAndInit = (el: HTMLElement) => {
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
