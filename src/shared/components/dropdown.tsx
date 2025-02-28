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
import cx from 'classix';
import { createContext, type JSX, splitProps, useContext } from 'solid-js';
import { createEffect, createSignal, createUniqueId, onCleanup } from 'solid-js';

import { GhostButton } from '~/shared/components/button';
import { type FormElementControl } from '~/shared/components/form-element-control';
import { FormElementProvider } from '~/shared/components/form-element-provider';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { evtWin } from '~/shared/utility/multi-view';
import {
	createEventDelegate,
	type EventDelegateProps,
} from '~/shared/utility/solid/create-event-delegate';
import { PropBuilder } from '~/shared/utility/solid/prop-builder';
import { T } from '~/shared/utility/text/t-components';

/** Track all open dropdowns so easier to close */
const openDropdowns = new WeakMap<Document, Set<HTMLElement>>();

registerDocumentSetup((document) => {
	const POPOVER_OPEN_ATTR = 'data-popover-open';

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
	middleware?: Middleware[] | undefined;
	/** Placement of dropdown */
	placement?: Placement | undefined;
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
	propBuilder.setAttr('id', () => props.id ?? createUniqueId());

	const dropdownProps = propBuilder.merge(rest);
	return (
		<div {...dropdownProps} class={cx('c-dropdown__content', rest.class)} popover>
			<div class="c-dropdown__children">{local.children}</div>
			<div class="c-dropdown__footer">
				<GhostButton class="v-input-sm" onClick={closePopover} unsetFormInput>
					<T>Close</T>
				</GhostButton>
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
			placement: props.placement ?? 'bottom-start',
			middleware: props?.middleware ?? [
				offset(4),
				flip({
					// Somewhat large padding for flip because dropdown content is resizable
					// (overflow: auto) and will technically "fit" in smaller spaces but look
					// really squished / require excessive scrolling
					padding: 100,
				}),
				shift({ padding: 4 }),
				size({
					apply({ elements, availableWidth, availableHeight }) {
						elements.floating.style.setProperty(
							'--c-dropdown__computed-max-width',
							`${Math.max(0, availableWidth - 8)}px`,
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

		menuElm.style.setProperty('--c-dropdown__left', `${x}px`);
		menuElm.style.setProperty('--c-dropdown__top', `${y}px`);
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
			if (!visible() && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
				e.preventDefault();
				const trigger = e.target as HTMLElement;

				// Don't open for comobobox (select has its own handlers)
				if (trigger.role !== 'combobox') {
					openDropdown();
				}

				// For menus and dialogs, move focus into menu
				if (trigger.ariaHasPopup === 'menu') {
					const items = dropdownContentCtrl
						.ref()
						?.querySelectorAll('[role="menuitem"]') as NodeListOf<HTMLElement>;
					if (e.key === 'ArrowDown') {
						items?.[0]?.focus();
					} else {
						items?.[items.length - 1]?.focus();
					}
				}
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
