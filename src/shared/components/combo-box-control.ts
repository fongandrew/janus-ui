import { type JSX } from 'solid-js';

import { ListBoxControl, type ListBoxProps } from '~/shared/components/list-box-control';
import { OptionListControl } from '~/shared/components/option-list-control';
import { isTextInput } from '~/shared/utility/element-types';
import { generateId } from '~/shared/utility/id-generator';

/** Base props for ComboBox are identical to ListBox for now */
export type ComboBoxProps = ListBoxProps;

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
 * PropBuilder presentation of something matching the ComboBox role. Adds effects
 * and aria- props. This extends the ListBox control since it has all the state
 * management bits and bobs, but the actual ListBox will via the listCtrl element.
 */
export class ComboBoxControl<
	TTag extends keyof JSX.HTMLElementTags = keyof JSX.HTMLElementTags,
> extends ListBoxControl<TTag> {
	listCtrl: OptionListControl<'div'>;

	constructor(protected override props: ComboBoxProps) {
		super(props);

		// Separate control for related listbox
		this.listCtrl = new OptionListControl<'div'>({
			onSelect: (_value, element, event) => {
				this.select(element, event);
			},
		});
		this.listCtrl.setAttr('role', 'listbox');
		this.listCtrl.defaultAttr('id', () => generateId('combobox-list'));

		this.setAttr('role', 'combobox');
		this.setAttr('aria-autocomplete', 'list');
		this.setAttr('aria-controls', () => this.listCtrl.id() ?? undefined);
		this.handle('onKeyDown', handleEscKeyDown);
	}
}
