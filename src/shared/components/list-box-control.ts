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
	/** Active higlight ID (controlled) */
	currentId?: string | null | undefined;
	/** Called when selection changes */
	onValues?: (value: Set<string>, event: MouseEvent | KeyboardEvent) => void;
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
	private readonly unctrlCurrentId: Accessor<string | null>;
	/** Set ID of currently highlighted element (if not set via props) */
	private readonly setUnctrlCurrentId: Setter<string | null>;
	/** Get uncontrolled value selection (if not set via props) */
	private readonly unctrlValues: Accessor<Set<string>>;
	/** Set uncontrolled value selection (if not set via props) */
	private readonly setUnctrlValues: Setter<Set<string>>;

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

		this.setAttr('role', () => 'listbox' as const);
		this.setAttr('aria-activedescendant', () => this.currentId() ?? undefined);
		this.setAttr('aria-multiselectable', () => this.props.multiple);
		this.setAttr('aria-required', () => this.props.required);

		// Update ARIA selected state when values change
		createRenderEffect(() => {
			// Calling `values()` here outside of for loop to ensure reactivity tracked
			const currentValues = this.values();
			for (const option of this.items()) {
				const optionValue = option.getAttribute(LIST_OPTION_VALUE_ATTR);
				if (optionValue) {
					option.ariaSelected = String(currentValues.has(optionValue));
				}
			}
		});

		// Update ARIA current state when currentId changes
		createRenderEffect(() => {
			const listBox = this.listElm();
			if (!listBox) return;

			const nextId = this.currentId();
			const next = nextId && listBox.ownerDocument.getElementById(nextId);
			const prev = listBox.querySelector('[aria-current="true"]');
			if (prev && prev !== next) {
				prev.ariaCurrent = null;
			}
			if (next) {
				next.ariaCurrent = 'true';
			}
		});
	}

	currentId() {
		return this.props.currentId ?? this.unctrlCurrentId();
	}

	values() {
		return this.props.values ?? this.unctrlValues();
	}

	setValues(newValues: Set<string>, event: KeyboardEvent | MouseEvent) {
		this.props.onValues?.(newValues, event);
		this.setUnctrlValues(newValues);
	}

	override highlight(element: HTMLElement | null, event: KeyboardEvent): void {
		this.setUnctrlCurrentId(element?.id ?? null);
		super.highlight(element, event);
	}

	override select(element: HTMLElement | null, event: KeyboardEvent | MouseEvent): void {
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

		this.listElm()?.dispatchEvent(new Event('change'));
		this.setValues(newValues, event);
	}
}
