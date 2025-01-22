import { type JSX } from 'solid-js';

import { ComboBoxControl, type ComboBoxProps } from '~/shared/components/combo-box-control';

/** Base props for Select are identical to ComboBox for now */
export type SelectControlProps = ComboBoxProps;

/**
 * PropBuilder presentation of something matching the Select role. This extends
 * ComboBoxControl since it has all the state management bits and bobs, but the
 * actual ListBox will be via the listCtrl element.
 */
export class SelectControl<
	TTag extends keyof JSX.HTMLElementTags = 'select' | 'button' | 'input',
> extends ComboBoxControl<TTag> {
	constructor(protected override props: SelectControlProps) {
		super(props);
		super.setAttr('aria-haspopup', 'listbox');

		super.handle('onBlur', (event) => {
			const relatedTarget = event.relatedTarget as HTMLElement | null;
			if (!relatedTarget) return;
			if (this.ref()?.contains(relatedTarget)) return;
			if (this.listElm()?.contains(relatedTarget)) return;
			this.hide();
		});

		super.handle('onChange', () => {
			if (!props.multiple) {
				this.hide();
			}
		});
	}

	hide() {
		(this.listCtrl.ref()?.closest('[popover]') as HTMLElement | null)?.hidePopover();
	}

	show() {
		(this.listCtrl.ref()?.closest('[popover]') as HTMLElement | null)?.showPopover();
	}
}
