import { isTextInput } from '~/shared/utility/element-types';
import { isFocusVisible, setFocusVisible } from '~/shared/utility/is-focus-visible';
import { evtDoc } from '~/shared/utility/multi-view';
import { nextIndex } from '~/shared/utility/next-index';
import { PropBuilder } from '~/shared/utility/solid/prop-builder';

/** Base props for different kinds of option lists (e.g. combobox, listbox, menu) */
export interface OptionListProps {
	/** Callback for when element is highlighted via arrow keys */
	onHighlight?: (id: string | null, element: HTMLElement, event: KeyboardEvent | null) => void;
	/** Callback for when element is selected */
	onSelect?: (value: string, element: HTMLElement, event: KeyboardEvent | MouseEvent) => void;
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

/** Delegated keydown handler, meant to be bound to props */
export function handleKeyDown(ctrl: OptionListControl, event: KeyboardEvent) {
	const document = evtDoc(event);

	const target = event.target as HTMLElement;
	const listElement = ctrl.listElm();
	if (!listElement) return;

	// Get elements from list element
	const items = ctrl.items();

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
				ctrl.highlight(items[nextIndex(items, currentIndex)] ?? null, event);
			} else {
				ctrl.highlight(items[0] ?? null, event);
				// Indicate that focus is visible now so we don't get stuck
				// in a stuck state
				setFocusVisible(true);
			}
			break;
		}
		case 'ArrowUp': {
			event.preventDefault();
			ctrl.highlight(items[nextIndex(items, currentIndex, -1)] ?? null, event);
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
				ctrl.select(highlighted, event);
			}
			break;
		}
	}
}

/** Delegated click handler */
export function handleClick(ctrl: OptionListControl, event: MouseEvent | KeyboardEvent) {
	ctrl.select(
		(event.target as HTMLElement | null)?.closest(
			`[${LIST_OPTION_VALUE_ATTR}]`,
		) as HTMLElement | null,
		event,
	);
}

/**
 * PropBuilder presentation of a list of options that can be navigated with arrow keys
 */
export class OptionListControl<T extends HTMLElement = HTMLElement> extends PropBuilder<T> {
	constructor(protected props: OptionListProps) {
		super();
		this.handle('onClick', [handleClick, this]);
		this.handle('onKeyDown', [handleKeyDown, this]);
	}

	listElm() {
		const closest = this.ref()?.closest('[role="listbox"], [role="menu"], [aria-controls]') as
			| HTMLElement
			| null
			| undefined;

		const ariaControlsId = closest?.getAttribute('aria-controls');
		const ariaControlled =
			ariaControlsId && closest?.ownerDocument.getElementById(ariaControlsId);
		if (ariaControlled) {
			return ariaControlled;
		}

		if (closest?.role === 'listbox' || closest?.role === 'menu') {
			return closest;
		}

		return null;
	}

	items() {
		return Array.from(
			this.listElm()?.querySelectorAll(`[${LIST_OPTION_VALUE_ATTR}]`) ?? [],
		) as HTMLElement[];
	}

	item(value: string) {
		return (this.listElm()?.querySelector(`[${LIST_OPTION_VALUE_ATTR}="${value}"]`) ??
			null) as HTMLElement | null;
	}

	highlight(element: HTMLElement | null, event: KeyboardEvent) {
		const id = element?.id;
		if (!id) return;
		this.props.onHighlight?.(id, element, event);

		// Scroll adjustment logic
		const window = element.ownerDocument.defaultView;
		const container = element.closest(`[${SCROLL_CONTAINER_ATTR}]`) as HTMLElement | null;
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
			lastHighlightedElementMap.set(container, element);
		}
	}

	select(element: HTMLElement | null, event: KeyboardEvent | MouseEvent) {
		if (!element) return;
		const value = element.getAttribute(LIST_OPTION_VALUE_ATTR);
		if (typeof value !== 'string') return;
		this.props.onSelect?.(value, element, event);
	}
}
