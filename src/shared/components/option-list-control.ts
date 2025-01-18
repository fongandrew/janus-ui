import { isTextInput } from '~/shared/utility/element-types';
import { isFocusVisible, setFocusVisible } from '~/shared/utility/is-focus-visible';
import { evtDoc } from '~/shared/utility/multi-view';
import { nextIndex } from '~/shared/utility/next-index';
import { PropBuilder } from '~/shared/utility/solid/prop-builder';

/** Base props for different kinds of option lists (e.g. combobox, listbox, menu) */
export interface OptionListProps {
	/** Callback for when element is highlighted via arrow keys */
	onHighlight: (value: string, element: HTMLElement, event: KeyboardEvent | null) => void;
	/** Callback for when element is selected */
	onSelect: (value: string, element: HTMLElement, event: KeyboardEvent | MouseEvent) => void;
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
export function doHighlight(
	[props, highlightedElement]: [OptionListProps, HTMLElement | null | undefined],
	event: KeyboardEvent,
) {
	if (!highlightedElement) return;
	const value = highlightedElement.getAttribute(LIST_OPTION_VALUE_ATTR);
	if (typeof value !== 'string') return;
	props.onHighlight(value, highlightedElement, event);

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
export function doSelect(
	[props, selectedElement]: [OptionListProps, HTMLElement | null | undefined],
	event: KeyboardEvent | MouseEvent,
) {
	if (!selectedElement) return;
	const value = selectedElement.getAttribute(LIST_OPTION_VALUE_ATTR);
	if (typeof value !== 'string') return;
	props.onSelect(value, selectedElement, event);
}

/**
 * Target of an event may be inside list or controlling it from outside, so grab accordingly
 */
export function getListElement(target: HTMLElement | null | undefined) {
	const closest = target?.closest('[role="listbox"], [role="menu"], [aria-controls]') as
		| HTMLElement
		| null
		| undefined;

	const ariaControlsId = closest?.getAttribute('aria-controls');
	const ariaControlled = ariaControlsId && closest?.ownerDocument.getElementById(ariaControlsId);
	if (ariaControlled) {
		return ariaControlled;
	}

	if (closest?.role === 'listbox' || closest?.role === 'menu') {
		return closest;
	}

	return null;
}

/**
 * Get all items with a value attribute from a list element
 */
export function getItemsForList(listElement: HTMLElement | null | undefined) {
	if (!listElement) return [];
	return Array.from(listElement.querySelectorAll(`[${LIST_OPTION_VALUE_ATTR}]`)) as HTMLElement[];
}

/** Delegated keydown handler, meant to be bound to props */
export function handleKeyDown(props: OptionListProps, event: KeyboardEvent) {
	const document = evtDoc(event);

	const target = event.target as HTMLElement;
	const listElement = getListElement(target);
	if (!listElement) return;

	// Get elements from list element
	const items = getItemsForList(listElement);

	// Get current highlight (assumed to be aria-activedescendant on the control
	// or the current focused item)
	const activeDescendantId = target.getAttribute('aria-activedescendant');
	const highlighted = ((activeDescendantId && document?.getElementById(activeDescendantId)) ??
		listElement.querySelector(`[${LIST_OPTION_VALUE_ATTR}]:focus`)) as HTMLElement | null;
	const currentIndex = highlighted ? items.indexOf(highlighted) : -1;

	switch (event.key) {
		case 'ArrowDown': {
			event.preventDefault();
			// First item gets autofocused, but if focus isn't visible, this is
			// a bit weird since it'll jump to the second item when you hit down.
			// So explicitly select it if not already visible
			if (isFocusVisible()) {
				doHighlight([props, items[nextIndex(items, currentIndex)]], event);
			} else {
				doHighlight([props, items[0]], event);
				// Indicate that focus is visible now so we don't get stuck
				// in a stuck state
				setFocusVisible(true);
			}
			break;
		}
		case 'ArrowUp': {
			event.preventDefault();
			doHighlight([props, items[nextIndex(items, currentIndex, -1)]], event);
			break;
		}
		case 'Enter':
		case ' ': {
			// Don't count spaces for inputs since intent may be to type a space
			if (event.key === ' ' && isTextInput(event.target as HTMLElement)) {
				break;
			}
			if (highlighted) {
				event.preventDefault();
				doSelect([props, highlighted], event);
			}
			break;
		}
	}
}

/** Delegated click handler */
export function handleClick(props: OptionListProps, event: MouseEvent | KeyboardEvent) {
	doSelect(
		[
			props,
			(event.target as HTMLElement | null)?.closest(
				`[${LIST_OPTION_VALUE_ATTR}]`,
			) as HTMLElement | null,
		],
		event,
	);
}

export class OptionListControl<T extends HTMLElement> extends PropBuilder<T> {
	constructor(private props: OptionListProps) {
		super();
		this.handle('onClick', [handleClick, props]);
		this.handle('onKeyDown', [handleKeyDown, props]);
	}

	listElm() {
		return getListElement(this.ref());
	}

	items() {
		return getItemsForList(this.listElm());
	}

	item(value: string) {
		return (this.listElm()?.querySelector(`[${LIST_OPTION_VALUE_ATTR}="${value}"]`) ??
			null) as HTMLElement | null;
	}

	highlight(element: HTMLElement | null, event: KeyboardEvent) {
		doHighlight([this.props, element], event);
	}

	select(element: HTMLElement | null, event: KeyboardEvent | MouseEvent) {
		doSelect([this.props, element], event);
	}
}
