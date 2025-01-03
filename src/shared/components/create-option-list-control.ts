import { createSignal } from 'solid-js';

import { isTextInput } from '~/shared/utility/element-types';
import { isFocusVisible, setFocusVisible } from '~/shared/utility/is-focus-visible';
import { nextIndex } from '~/shared/utility/next-index';
import { createEventDelegate } from '~/shared/utility/solid/create-event-delegate';

/** Base props for different kinds of option lists (e.g. combobox, listbox, menu) */
export interface OptionListProps {
	/** Callback for when element is highlighted via arrow keys */
	onHighlight: (event: KeyboardEvent, element: HTMLElement, value: string) => void;
	/** Callback for when element is selected */
	onSelect: (event: KeyboardEvent | MouseEvent, element: HTMLElement, value: string) => void;
}

/**
 * Data variable used to identify the associated value of an element since an actual
 * value attribute may be semantically incorrect.
 */
export const LIST_OPTION_VALUE_ATTR = 'data-list-option-value';

/**
 * Data variable to identify a scrollable container
 */
export const SCROLL_CONTAINER_ATTR = 'data-scroll-container';

/** WeakMap to store the last highlighted element for each container */
const lastHighlightedElementMap = new WeakMap<HTMLElement, HTMLElement | null>();

/** Helper to handle highlighting and value passing */
function doHighlight(
	event: KeyboardEvent & { props: OptionListProps },
	highlightedElement: HTMLElement | null | undefined,
) {
	if (!highlightedElement) return;
	const value = highlightedElement.getAttribute(LIST_OPTION_VALUE_ATTR);
	if (typeof value !== 'string') return;
	event.props.onHighlight(event, highlightedElement, value);

	// Scroll adjustment logic
	const window = highlightedElement.ownerDocument.defaultView;
	const container = highlightedElement.closest(
		`[${SCROLL_CONTAINER_ATTR}]`,
	) as HTMLElement | null;
	if (container) {
		if (!lastHighlightedElementMap.has(container)) {
			window?.requestAnimationFrame(() => {
				const lastHighlightedElement = lastHighlightedElementMap.get(container);
				if (lastHighlightedElement) {
					const containerRect = container.getBoundingClientRect();
					const elementRect = lastHighlightedElement.getBoundingClientRect();

					if (elementRect.top < containerRect.top) {
						// Element is above the visible area
						container.scrollTop -= containerRect.top - elementRect.top;
					} else if (elementRect.bottom > containerRect.bottom) {
						// Element is below the visible area
						container.scrollTop += elementRect.bottom - containerRect.bottom;
					}
				}
				lastHighlightedElementMap.delete(container);
			});
		}
		lastHighlightedElementMap.set(container, highlightedElement);
	}
}

/** Helper to handle selection of value */
function doSelect(
	event: (KeyboardEvent | MouseEvent) & { props: OptionListProps },
	selectedElement: HTMLElement | null | undefined,
) {
	if (!selectedElement) return;
	const value = selectedElement.getAttribute(LIST_OPTION_VALUE_ATTR);
	if (typeof value !== 'string') return;
	event.props.onSelect(event, selectedElement, value);
}

/** Delegated keydown handler */
export const useKeydown = createEventDelegate<'keydown', OptionListProps>('keydown', (event) => {
	const delegateTarget = event.delegateTarget;

	// Get list element (assumed to be delegate target unless there's an aria-controls)
	let listElement = delegateTarget;
	const ariaControlsId = listElement.getAttribute('aria-controls');
	const ariaControlled =
		ariaControlsId && listElement.ownerDocument.getElementById(ariaControlsId);
	if (ariaControlled) {
		listElement = ariaControlled;
	}

	// Get elements from list element
	const items = Array.from(
		listElement.querySelectorAll(`[${LIST_OPTION_VALUE_ATTR}]`),
	) as HTMLElement[];

	// Get current highlight (assumed to be aria-activedescendant on the control
	// or the current focused item)
	const activeDescendantId = delegateTarget.getAttribute('aria-activedescendant');
	const highlighted = ((activeDescendantId &&
		delegateTarget.ownerDocument.getElementById(activeDescendantId)) ??
		listElement.querySelector(`[${LIST_OPTION_VALUE_ATTR}]:focus`)) as HTMLElement | null;
	const currentIndex = highlighted ? items.indexOf(highlighted) : -1;

	switch (event.key) {
		case 'ArrowDown': {
			event.preventDefault();
			// First item gets autofocused, but if focus isn't visible, this is
			// a bit weird since it'll jump to the second item when you hit down.
			// So explicitly select it if not already visible
			if (isFocusVisible()) {
				doHighlight(event, items[nextIndex(items, currentIndex)]);
			} else {
				doHighlight(event, items[0]);
				// Indicate that focus is visible now so we don't get stuck
				// in a stuck state
				setFocusVisible(true);
			}
			break;
		}
		case 'ArrowUp': {
			event.preventDefault();
			doHighlight(event, items[nextIndex(items, currentIndex, -1)]);
			break;
		}
		case 'Enter':
		case ' ': {
			// Don't count spaces for inputs since intent may be to type a space
			if (event.key === ' ' && isTextInput(event.target)) {
				break;
			}
			if (highlighted) {
				event.preventDefault();
				doSelect(event, highlighted);
			}
			break;
		}
	}
});

/** Delegated click handler */
export const useClick = createEventDelegate<'click', OptionListProps>('click', (event) => {
	doSelect(event, event.target?.closest(`[${LIST_OPTION_VALUE_ATTR}]`) as HTMLElement | null);
});

/**
 * Adds keyboard and selection handling for an option-list element
 */
export function createOptionListControl(props: OptionListProps) {
	const [listElement, setListElement] = createSignal<HTMLElement | null>(null);
	useKeydown(listElement, props);
	useClick(listElement, props);
	return [
		setListElement,
		{
			getNode: listElement,
			getFirstItem: () => {
				const node = listElement();
				if (!node) return null;
				return node.querySelector(`[${LIST_OPTION_VALUE_ATTR}]`) as HTMLElement | null;
			},
			getItemByValue: (value: string) => {
				const node = listElement();
				if (!node) return null;
				return node.querySelector(
					`[${LIST_OPTION_VALUE_ATTR}="${value}"]`,
				) as HTMLElement | null;
			},
			getItems: () => {
				const node = listElement();
				if (!node) return [];
				return Array.from(
					node.querySelectorAll(`[${LIST_OPTION_VALUE_ATTR}]`),
				) as HTMLElement[];
			},
			highlight: (event: KeyboardEvent, highlightedElement: HTMLElement | null) => {
				if (!highlightedElement) return;
				const value = highlightedElement?.getAttribute(LIST_OPTION_VALUE_ATTR);
				if (typeof value !== 'string') return;
				props.onHighlight?.(event, highlightedElement, value);
			},
			select: (event: KeyboardEvent | MouseEvent, selectedElement: HTMLElement | null) => {
				if (!selectedElement) return;
				const value = selectedElement?.getAttribute(LIST_OPTION_VALUE_ATTR);
				if (typeof value !== 'string') return;
				props.onSelect?.(event, selectedElement, value);
			},
		},
	] as const;
}
