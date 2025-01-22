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
import cx from 'classix';
import { createContext, type JSX, splitProps, useContext } from 'solid-js';
import { createEffect, createSignal, onCleanup } from 'solid-js';

import { Button } from '~/shared/components/button';
import { type FormElementControl } from '~/shared/components/form-element-control';
import { FormElementProvider } from '~/shared/components/form-element-provider';
import { SCROLL_CONTAINER_ATTR } from '~/shared/components/option-list-control';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { generateId } from '~/shared/utility/id-generator';
import { evtWin } from '~/shared/utility/multi-view';
import {
	createEventDelegate,
	type EventDelegateProps,
} from '~/shared/utility/solid/create-event-delegate';
import { PropBuilder } from '~/shared/utility/solid/prop-builder';
import { T } from '~/shared/utility/text/t-components';

/** Track all open dropdowns so easier to close */
const openDropdowns = new WeakMap<Document, Set<HTMLElement>>();

// We use manual popovers instead of default auto popovers because the light dismiss feature
// of auto popovers doesn't work well on mobile iOS as of 18.3, and because there are weird
// quirks with mobiel Android when tryign to implement a backdrop that "blocks" click through.
registerDocumentSetup((document) => {
	openDropdowns.set(document, new Set());

	// Close dropdowns when clicking on backdrop / overlay area
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
			if (nearestRoot !== dropdown && nearestRoot.contains(dropdown)) {
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

	// Close dropdowns when pressing escape
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

/**
 * Popovers are opened and closed imperatively, and there are some component-scoped
 * signals that need to update when that happens. Also updates the open dropdown
 * set we use to avoid multiple open dropdowns and implement light dismiss.
 */
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
			openDropdowns.get(document)?.add(typedEvent.target);
		} else {
			openDropdowns.get(document)?.delete(typedEvent.target);
		}
		typedEvent.props.setVisible(typedEvent.newState === 'open');
	},
	true,
);

export interface DropdownContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Make children required */
	children: JSX.Element;
}

export interface DropdownProps {
	/** Positioning middleware */
	middleware?: Middleware[];
	/**
	 * Two children required -- context and menu. And must be render funcs
	 * for us to set context properly.
	 */
	children: [() => JSX.Element, () => JSX.Element];
}

export const DropdownContentContext = createContext<PropBuilder<'div'> | undefined>();

/** Generic callback for closing parent popover */
function closePopover(e: MouseEvent | KeyboardEvent) {
	const target = e.target as HTMLElement;
	const popover = target.closest(':popover-open') as HTMLElement | null;
	popover?.hidePopover();
}

/** A wrapper component that applies Dropdown styling and connects to `createDropdown` */
export function DropdownContent(props: DropdownContentProps) {
	const [local, rest] = splitProps(props, ['children']);

	const propBuilder = useContext(DropdownContentContext) ?? new PropBuilder<'div'>();
	propBuilder.setAttr('id', () => props.id ?? generateId('dropdown'));
	propBuilder.setAttr(SCROLL_CONTAINER_ATTR, 'true');

	return (
		<div
			{...propBuilder.merge(rest)}
			class={cx('c-dropdown__content', rest.class)}
			popover="manual"
		>
			<div class="c-dropdown__children">{local.children}</div>
			<div class="c-dropdown__footer">
				<Button class="c-button--ghost c-button--sm" onClick={closePopover} unsetFormInput>
					<T>Close</T>
				</Button>
			</div>
		</div>
	);
}

/** The wrapper component */
export function Dropdown(props: DropdownProps) {
	const dropdownContentCtrl = new PropBuilder<'div'>();
	const [trigger, setTrigger] = createSignal<HTMLDivElement | null>(null);
	const [visible, setVisible] = createSignal(false);

	// Callback for updating position
	const updatePosition = async () => {
		const triggerElm = trigger();
		if (!triggerElm) return;

		const menuElm = dropdownContentCtrl.ref();
		if (!menuElm) return;

		const { x, y } = await computePosition(triggerElm, menuElm, {
			placement: 'bottom',
			middleware: props?.middleware ?? [
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
			strategy: 'fixed',
		});

		menuElm.style.setProperty('--c-dropdown-left', `${x}px`);
		menuElm.style.setProperty('--c-dropdown-top', `${y}px`);
	};

	// Main effect for showing + positioning dropdown
	createEffect(() => {
		const triggerElm = trigger();
		if (!triggerElm) return;

		const menuElm = dropdownContentCtrl.ref();
		if (!menuElm) return;

		// No need to do anything if not visible. Popover API should hide automatically
		// because we're hiding with hidePopover(), which updates the visible signal,
		// not the other way around
		if (!visible()) {
			return;
		}

		// Menu is visible. Do initial position update, then update automatically when
		// scroll or resize events occur.
		updatePosition();
		const cleanup = autoUpdate(triggerElm, menuElm, updatePosition);
		onCleanup(cleanup);
	});

	// Menu can be imperatively opened / closed via hidePopover / showPopover
	// This syncs internal component state with this via the toggle event
	useBeforeToggle(() => dropdownContentCtrl.ref() ?? null, { setVisible });

	const openDropdown = () => dropdownContentCtrl.ref()?.showPopover();
	const triggerCtrlRef = (control: FormElementControl) => {
		control.addRef(setTrigger);

		(control as PropBuilder<'button'>).setAttr('popoverTarget', () => dropdownContentCtrl.id());
		control.setAttr('aria-expanded', visible);
		control.defaultAttr('aria-haspopup', 'menu');

		control.handle('onClick', (e) => {
			evtWin(e)?.requestAnimationFrame(openDropdown);
		});
		control.handle('onKeyDown', (e) => {
			if (e.key === 'ArrowDown' && !visible()) {
				openDropdown();
				e.preventDefault();
			}
		});
	};

	return (
		<>
			<FormElementProvider ctrlRef={triggerCtrlRef}>
				{props.children[0]()}
			</FormElementProvider>
			<DropdownContentContext.Provider value={dropdownContentCtrl}>
				{props.children[1]()}
			</DropdownContentContext.Provider>
		</>
	);
}
