import { type Accessor, createRenderEffect, createSignal, type JSX, type Setter } from 'solid-js';

import {
	LIST_OPTION_VALUE_ATTR,
	OptionListControl,
	type OptionListProps,
} from '~/shared/components/option-list-control';

/** Base props for ListBox */
export interface ListBoxProps extends OptionListProps {
	/** Default selected values (uncontrolled) */
	defaultValues?: Set<string> | undefined;
	/** Currently selected values (controlled) */
	values?: Set<string> | undefined;
	/** Active highlight ID (controlled) */
	currentId?: string | null | undefined;
	/** Called when selection changes */
	onValues?: ((value: Set<string>, event: Event) => void) | undefined;
	/** Disables clearing selection */
	required?: boolean | undefined;
	/** Whether multiple selection is allowed */
	multiple?: boolean | undefined;
}

/**
 * PropBuilder presentation of something matching the ListBox role. Adds effects
 * and aria- props.
 */
export class ListBoxControl<
	TTag extends keyof JSX.HTMLElementTags = keyof JSX.HTMLElementTags,
> extends OptionListControl<TTag> {
	/** Get ID of currently highlighted element (if not set via props) */
	protected readonly unctrlCurrentId: Accessor<string | null>;
	/** Set ID of currently highlighted element (if not set via props) */
	protected readonly setUnctrlCurrentId: Setter<string | null>;
	/** Get uncontrolled value selection (if not set via props) */
	protected readonly unctrlValues: Accessor<Set<string>>;
	/** Set uncontrolled value selection (if not set via props) */
	protected readonly setUnctrlValues: Setter<Set<string>>;

	constructor(protected override props: ListBoxProps) {
		super(props);

		const [unctrlCurrentId, setUnctrlCurrentId] = createSignal<string | null>(null);
		this.unctrlCurrentId = unctrlCurrentId;
		this.setUnctrlCurrentId = setUnctrlCurrentId;

		const [unctrlValues, setUnctrlValues] = createSignal<Set<string>>(
			props.defaultValues ?? new Set<string>(),
		);
		this.unctrlValues = unctrlValues;
		this.setUnctrlValues = setUnctrlValues;

		this.setAttr('role', 'listbox');
		this.setAttr('aria-activedescendant', () => this.currentId() ?? undefined);
		this.setAttr('aria-multiselectable', () => this.props.multiple);
		this.setAttr('aria-required', () => this.props.required);

		// Tabbing on a selection counts as highlight per WCAG reccomendations
		this.handle('onKeyDown', (e) => {
			if (this.props.multiple) return;
			if (e.key !== 'Tab') return;
			const currentValue = this.currentValue();
			if (typeof currentValue !== 'string' || this.values().has(currentValue)) return;
			this.select(this.item(currentValue), e);
		});

		// Update ARIA selected state when values change
		createRenderEffect(() => {
			// Calling `values()` here outside of for loop to ensure reactivity tracked
			let currentValues = this.values();

			// The actual selection happens when the listbox is blurrd, but we can
			// do a sort of pseudo-selection here for the single select case
			const currentValue = this.currentValue();
			if (currentValue && !this.props.multiple && !currentValues.has(currentValue)) {
				currentValues = new Set([currentValue]);
			}

			for (const option of this.items()) {
				const optionValue = option.getAttribute(LIST_OPTION_VALUE_ATTR);
				if (optionValue) {
					option.ariaSelected = String(currentValues.has(optionValue));
				}
			}
		});

		// Update highlighted state when currentId changes
		createRenderEffect(() => {
			// Call this first to ensure reactivity is tracked since this.listElm()
			// is not reactive
			const nextId = this.currentId();

			const listBox = this.listElm();
			if (!listBox) return;

			const next = nextId && listBox.ownerDocument.getElementById(nextId);
			const prev = listBox.querySelector<HTMLElement>('[data-c-option-list-active]');
			if (prev && prev !== next) {
				prev.removeAttribute('data-c-option-list-active');
			}
			if (next) {
				next.setAttribute('data-c-option-list-active', '');
			}
		});
	}

	currentId() {
		return this.props.currentId ?? this.unctrlCurrentId();
	}

	currentValue() {
		const currentId = this.currentId();
		if (!currentId) return null;
		return (
			this.ref()
				?.ownerDocument?.getElementById(currentId)
				?.getAttribute(LIST_OPTION_VALUE_ATTR) ?? null
		);
	}

	values() {
		return this.props.values ?? this.unctrlValues();
	}

	setValues(newValues: Set<string>, event: Event) {
		this.props.onValues?.(newValues, event);
		this.setUnctrlValues(newValues);
	}

	clear(event: Event) {
		if (!this.values().size) return;
		this.setValues(new Set<string>(), event);
		this.listElm()?.dispatchEvent(new Event('change'));
	}

	override highlight(element: HTMLElement | null, event: Event): void {
		this.setUnctrlCurrentId(element?.id ?? null);
		super.highlight(element, event);
	}

	override select(element: HTMLElement | null, event: Event): void {
		const value = element?.getAttribute(LIST_OPTION_VALUE_ATTR);
		if (typeof value !== 'string') return;

		const oldValues = this.values();
		const newValues = new Set(oldValues);
		if (this.props.multiple) {
			if (newValues.has(value)) {
				newValues.delete(value);
			} else {
				newValues.add(value);
			}
		} else {
			const shouldAdd = !newValues.has(value);
			newValues.clear();
			if (shouldAdd) {
				newValues.add(value);
			}
		}
		if (newValues.size === 0 && (this.props.required || !this.props.multiple)) {
			// We still want to call onValueChange even if nothing changes
			// so callbacks can do things like close dropdowns and whatnot
			this.props.onValues?.(oldValues, event);
			return;
		}

		this.setValues(newValues, event);
		this.setUnctrlCurrentId(element?.id ?? null);
		this.listElm()?.dispatchEvent(new Event('change'));
	}
}
