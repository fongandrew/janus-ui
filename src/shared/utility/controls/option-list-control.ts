import { Control } from '~/shared/utility/controls/control';
import { isTextInput } from '~/shared/utility/element-types';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';
import { data } from '~/shared/utility/magic-strings';
import { nextIndex } from '~/shared/utility/next-index';

/**
 * Data variable used to identify the associated value of an element since an actual
 * value attribute may be semantically incorrect.
 */
export const LIST_OPTION_VALUE_ATTR = data('list-option-value');

/** Base props for different kinds of option lists (e.g. combobox, listbox, menu) */
export interface OptionListProps {
	/** Callback for when element is highlighted via arrow keys */
	onHighlight?: (id: string | null, element: HTMLElement, event: Event) => void;
	/** Callback for when element is selected */
	onSelect?: (value: string, element: HTMLElement, event: Event) => void;
}

/**
 * Behavior for a list of options that can be navigated with arrow keys
 */
export class OptionListControl<TProps extends OptionListProps = OptionListProps> extends Control<
	HTMLElement,
	TProps
> {
	protected override onMount(): void {
		super.onMount();
		this.listen('click', this.handleClick);
		this.listen('keydown', this.handleKeyDown);
	}

	/** Can override this if we need temporarily disable click and keydown handling */
	enabled() {
		return true;
	}

	override handle(event: Event): void {
		if (!this.enabled()) return;
		return super.handle(event);
	}

	/**
	 * Get the associated list element containing all items (may be indirectly associated
	 * via aria-controls)
	 */
	listElm() {
		const closest = this.node.closest('[role="listbox"], [role="menu"], [aria-controls]') as
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

	/** Return all the items */
	items() {
		const ret = Array.from(
			this.listElm()?.querySelectorAll(`[${LIST_OPTION_VALUE_ATTR}]`) ?? [],
		) as HTMLElement[];
		return ret;
	}

	/** Get the list item matching a particular value */
	item(value: string) {
		return (this.listElm()?.querySelector(`[${LIST_OPTION_VALUE_ATTR}="${value}"]`) ??
			null) as HTMLElement | null;
	}

	/** Highlight a particular element via keyboard */
	highlight(element: HTMLElement | null, event: Event) {
		const id = element?.id;
		if (!id) return;
		this.props.onHighlight?.(id, element, event);

		// Scroll adjustment logic
		element.scrollIntoView({ block: 'nearest' });
	}

	/** Select a particular element via mosue or keyboard */
	select(element: HTMLElement | null, event: Event) {
		if (!element) return;
		const value = element.getAttribute(LIST_OPTION_VALUE_ATTR);
		if (typeof value !== 'string') return;
		this.props.onSelect?.(value, element, event);
	}

	/** Keydown handler that manages up/down arrow state */
	protected handleKeyDown(event: KeyboardEvent) {
		const document = this.document();
		const target = event.target as HTMLElement;
		const listElement = this.listElm();
		if (!listElement) return;

		// Get elements from list element
		const items = this.items();

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
				if (highlighted?.autofocus && !isFocusVisible()) {
					this.highlight(items[0] ?? null, event);
				} else {
					this.highlight(items[nextIndex(items, currentIndex, 1, true)] ?? null, event);
				}
				break;
			}
			case 'ArrowUp': {
				event.preventDefault();
				this.highlight(items[nextIndex(items, currentIndex, -1, true)] ?? null, event);
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
					this.select(highlighted, event);
				}
				break;
			}
		}
	}

	/** Clicking on a menu item */
	protected handleClick(event: MouseEvent) {
		this.select(
			(event.target as HTMLElement | null)?.closest(
				`[${LIST_OPTION_VALUE_ATTR}]`,
			) as HTMLElement | null,
			event,
		);
	}
}
