import {
	LIST_OPTION_VALUE_ATTR,
	OptionListControl,
	type OptionListProps,
} from '~/shared/utility/controls/option-list-control';
import { data } from '~/shared/utility/magic-strings';

/** Base props for ListBox */
export interface ListBoxProps extends OptionListProps {
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string> | undefined;
	/** Currently selected values (controlled) */
	values?: Set<string> | undefined;
	/** Called when selection changes */
	onValues?: ((value: Set<string>, event: Event) => void) | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
}

/** Data attribute for active / highlighted element */
export const ACTIVE_ATTR = data('c-option-list-active');

/** Data attribute to identify a designated container for hidden inputs */
export const HIDDEN_INPUT_CONTAINER_ATTR = data('listbox-hidden-inputs');

/** Data attribute to identify a clear action */
export const CLEAR_ACTION_ATTR = data('listbox-clear-action');

/**
 * UI handling for something matching the ListBox role. Adds effects
 * and aria- props.
 */
export class ListBoxBaseControl<
	TProps extends ListBoxProps = ListBoxProps,
> extends OptionListControl<TProps> {
	static override mapProps(p: ListBoxProps) {
		return {
			role: 'listbox' as const,
			'aria-multiselectable': p.multiple,
		};
	}

	/** div full of <input type="hidden"> form representation of values for this element */
	private hiddenInputContainer: HTMLDivElement | undefined;

	/** Return a set of selected values */
	values() {
		// Controlled element, just use this
		if (this.props.values) {
			return this.props.values;
		}

		// Uncontrolled -> check DOM
		const ret = new Set<string>();
		for (const elm of this.selectedDOM()) {
			const value = elm.getAttribute(LIST_OPTION_VALUE_ATTR);
			if (value) {
				ret.add(value);
			}
		}
		return ret;
	}

	override highlight(element: HTMLElement | null, event: Event): void {
		super.highlight(element, event);
		this.updateActive(element);

		// Psuedo-select the element on highlight (the actual selection + change event
		// happens when the user hits enter or tabs away but we want to present it
		// as selected)
		if (!this.props.multiple) {
			const prev = this.selectedDOM()[0];
			if (prev === element) return;
			prev?.setAttribute('aria-selected', 'false');
			element?.setAttribute('aria-selected', 'true');
		}
	}

	override select(element: HTMLElement | null, event: Event): void {
		const value = element?.getAttribute(LIST_OPTION_VALUE_ATTR);
		if (typeof value !== 'string') return;

		let values: Set<string>;
		if (this.props.multiple) {
			values = new Set(this.values());
			if (values.has(value)) {
				values.delete(value);
			} else {
				values.add(value);
			}
		} else {
			values = new Set([value]);
		}

		this.updateActive(element);
		this.handleValueChange(values, event);
	}

	protected override onMount(): void {
		super.onMount();

		// Set initial value attrs even if no values at all because this sets
		// up `aria-selected="false"` and other stuff
		this.updateValueAttrs(this.props.values || this.props.defaultValues);

		this.listen('click', this.handleClear);
		this.listen('keydown', this.handleTab);
	}

	protected override onUpdate() {
		super.onUpdate();

		const values = this.props.values;
		if (values) {
			this.updateValueAttrs(values);
		}
	}

	/**
	 * Handle value changes, including callbacks and events
	 */
	protected handleValueChange(newValues: Set<string>, event: Event) {
		this.updateValueAttrs(newValues);
		this.props.onValues?.(newValues, event);
		this.listElm()?.dispatchEvent(new Event('change'));
	}

	/**
	 * Update aria-activedescendant and other things when highlighted item changes
	 * (via keyboard -- mouse is just hover)
	 */
	protected updateActive(element: HTMLElement | null) {
		const prev = this.currentItem();
		if (prev === element) return;
		this.node.setAttribute('aria-activedescendant', element?.id ?? '');
		prev?.removeAttribute(ACTIVE_ATTR);
		element?.setAttribute(ACTIVE_ATTR, '');
	}

	/**
	 * Get the currently highlighted element
	 */
	private currentItem() {
		const currentId = this.node.getAttribute('aria-activedescendant');
		if (!currentId) return null;
		return this.document()?.getElementById(currentId) ?? null;
	}

	/**
	 * Get all selected nodes
	 */
	private selectedDOM() {
		return this.listElm()?.querySelectorAll(`[aria-selected="true"]`) ?? [];
	}

	/**
	 * Tabbing on a selection counts as highlight per WCAG reccomendations
	 */
	private handleTab(event: KeyboardEvent) {
		if (this.props.multiple) return;
		if (event.key !== 'Tab') return;
		const currentValue = this.currentItem()?.getAttribute(LIST_OPTION_VALUE_ATTR);
		if (typeof currentValue !== 'string' || this.values().has(currentValue)) return;
		this.select(this.item(currentValue), event);
	}

	private handleClear(event: Event) {
		if ((event.target as HTMLElement | null)?.hasAttribute(CLEAR_ACTION_ATTR)) {
			this.handleValueChange(new Set<string>(), event);
		}
	}

	/** Update attributes and other stuff based on values changing */
	private updateValueAttrs(values = new Set<string>()) {
		// Update ARIA selected state when values change
		for (const option of this.items()) {
			const optionValue = option.getAttribute(LIST_OPTION_VALUE_ATTR);
			if (optionValue) {
				option.ariaSelected = String(values.has(optionValue));
			}
		}

		// Update hidden inputs for each value if there is a name associated with the node
		this.updateHiddenInputs(values);
	}

	/**
	 * Update hidden input container with values for hidden inputs (so forms can "see"
	 * user input in this list box)
	 */
	private updateHiddenInputs(values: Set<string> | undefined) {
		const name = this.node.getAttribute('name');
		if (name) {
			const container = this.getHiddenInputContainer();

			const toAdd = new Set(values);
			for (const input of container.querySelectorAll('input')) {
				const value = input.value;
				if (toAdd.has(value)) {
					toAdd.delete(value);
				} else {
					input.remove();
				}
			}

			const document = this.document();
			for (const value of toAdd) {
				const input = document.createElement('input');
				input.type = 'hidden';
				input.name = name;
				input.value = value;
				container.appendChild(input);
			}
		}
	}

	/**
	 * Get or create hidden input container
	 */
	private getHiddenInputContainer() {
		// Do we already have a hidden input container?
		if (this.hiddenInputContainer?.isConnected) return this.hiddenInputContainer;

		// Is there a designated one in the DOM already (we prefer this over creating
		// our own to avoid reactive frameworks clobbering our element)
		let container = this.node.querySelector<HTMLDivElement>(`[${HIDDEN_INPUT_CONTAINER_ATTR}]`);

		// If not, create one
		if (!container) {
			container = this.document().createElement('div');
			container.setAttribute(HIDDEN_INPUT_CONTAINER_ATTR, '');
			this.node.appendChild(container);
		}

		this.hiddenInputContainer = container;
		return container;
	}
}
