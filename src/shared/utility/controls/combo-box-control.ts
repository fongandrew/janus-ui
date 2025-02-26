import { setControl } from '~/shared/utility/controls/control';
import {
	ListBoxBaseControl,
	type ListBoxProps,
} from '~/shared/utility/controls/list-box-base-control';
import { isTextInput } from '~/shared/utility/element-types';

/** ComboBox needs reference to companion listbox */
export interface ComboBoxProps extends ListBoxProps {
	/** Reference to listbox control */
	listBoxId: string;
}

/** Delegated key handler so escape key clears input */
export function handleEscKeyDown(event: KeyboardEvent) {
	const target = event.target as HTMLElement;

	// Esc key handling only
	if (event.key !== 'Escape') return;

	// Check that is an input element and not like a button or something
	if (!isTextInput(target)) return;
	if (!target.value) return;

	// If dropdown is open, then esc should close it first
	if (target.ariaExpanded === 'true') return;

	// If we get here, safe to clear
	target.value = '';
	target.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * UI handling for something matching the ComboBox role. Meant to reference the input
 * or button element that controls a listbox element (and takes an ID to reference the
 * listbox separately -- there is no need to use a ListBoxControl on that separate
 * element).
 */
export class ComboBoxControl<
	TProps extends ComboBoxProps = ComboBoxProps,
> extends ListBoxBaseControl<TProps> {
	static override mapProps(p: ComboBoxProps) {
		return {
			...super.mapProps(p),
			role: 'combobox' as const,
			'aria-autocomplete': 'list' as const,
			'aria-controls': p.listBoxId,
		};
	}

	private listBox: HTMLElement | null = null;

	protected override onMount(): void {
		super.onMount();

		// This element (this.node) will be the input or button that receives focus.
		// Need separate reference to list element.
		const listBox = this.document().getElementById(this.props.listBoxId);
		if (!listBox) {
			throw new Error(`ListBox element not found: ${this.props.listBoxId}`);
		}
		listBox.role = 'listbox';

		// Use this same control instance of listbox so we can handle events. Only event
		// we're really dealing with at the moment is the click event (since keydowns will
		// be on the associated input element) and the handler works either way, but we can
		// tweak the handlers themselves to make sure they're targeting the right element
		// if necessary.
		setControl(listBox, this);
		this.listBox = listBox;

		this.listen('keydown', this.handleEscKeyDown);
	}

	/**
	 * Unlikely but technically possible for combobox input to be cleaned up independently
	 * of associated listbox, so we should clean up.
	 */
	protected override onCleanUp(): void {
		super.onCleanUp();
		if (this.listBox) {
			setControl(this.listBox, undefined);
		}
	}

	/**
	 * ListBox will trigger the change event on the ListBox element but we
	 * want to trigger it on the ComboBox element as well validation
	 */
	protected override handleValueChange(newValues: Set<string>, event: Event) {
		super.handleValueChange(newValues, event);
		this.node?.dispatchEvent(new Event('change'));
	}

	/** Key handler so escape key clears input */
	protected handleEscKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLElement;

		// Esc key handling only
		if (event.key !== 'Escape') return;

		// Check that is an input element and not like a button or something
		if (!isTextInput(target)) return;
		if (!target.value) return;

		// If dropdown is open, then esc should close it first
		if (target.ariaExpanded === 'true') return;

		// If we get here, safe to clear
		target.value = '';
		target.dispatchEvent(new Event('input', { bubbles: true }));
	}
}
