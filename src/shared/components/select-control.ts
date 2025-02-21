import { type JSX } from 'solid-js';

import { ComboBoxControl, type ComboBoxProps } from '~/shared/components/combo-box-control';
import { isTextInput } from '~/shared/utility/element-types';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';

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
	private noShowOnKeyDown = new WeakSet<Event>();

	constructor(protected override props: SelectControlProps) {
		super(props);
		this.setAttr('aria-haspopup', 'listbox');

		this.handle('onFocusOut', (event) => {
			if (!isFocusVisible()) return;
			const relatedTarget = event.relatedTarget as HTMLElement | null;
			if (!relatedTarget) return;
			if (this.ref()?.contains(relatedTarget)) return;
			if (this.listElm()?.contains(relatedTarget)) return;
			this.hide();
		});

		this.handle('onKeyDown', (event: KeyboardEvent) => {
			if (
				(event.key.length === 1 ||
					event.key.startsWith('Arrow') ||
					event.key === 'Enter') &&
				!this.noShowOnKeyDown.has(event)
			) {
				this.show();
			}

			// Prevent default so that we don't submit form if enter key is pressed while
			// text input is focused. That may be the expected behavior for an actual
			// input, but behaviorally, this combobox input behaves much more like a
			// select element (which doesn't submit form on enter in Chroem at least).
			if (isTextInput(event.target as Element | null) && event.key === 'Enter') {
				event.preventDefault();
			}
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
			this.noShowOnKeyDown.add(event);
		}
	}
}
