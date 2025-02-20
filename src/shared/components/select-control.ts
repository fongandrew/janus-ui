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
		this.setAttr('aria-haspopup', 'listbox');

		this.handle('onFocusOut', (event) => {
			const relatedTarget = event.relatedTarget as HTMLElement | null;
			if (!relatedTarget) return;
			if (this.ref()?.contains(relatedTarget)) return;
			if (this.listElm()?.contains(relatedTarget)) return;
			this.hide();
		});
	}

	protected popover() {
		return this.listCtrl.ref()?.closest('[popover]') as HTMLElement | null;
	}

	override enabled() {
		return !!this.popover()?.matches(':popover-open');
	}

	hide() {
		this.popover()?.hidePopover();
		if (!this.props.multiple) {
			this.setUnctrlCurrentId(null);
		}
	}

	show() {
		this.popover()?.showPopover();
	}

	toggle() {
		this.popover()?.togglePopover();
	}

	override select(element: HTMLElement, event: Event) {
		super.select(element, event);
		if (!this.props.multiple) {
			this.hide();
		}
	}
}
