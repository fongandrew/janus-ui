import { ComboBoxControl, type ComboBoxProps } from '~/shared/utility/controls/combo-box-control';
import { isTextInput } from '~/shared/utility/element-types';
import { isFocusVisible } from '~/shared/utility/is-focus-visible';

/** Base props for Select are identical to ComboBox for now */
export type SelectControlProps = ComboBoxProps;

/**
 * UI handling for a select input (basically a combobox with a dropdown)
 */
export class SelectBaseControl<
	TProps extends SelectControlProps = SelectControlProps,
> extends ComboBoxControl<TProps> {
	static override mapProps(p: SelectControlProps) {
		return {
			...super.mapProps(p),
			'aria-haspopup': 'listbox' as const,
		};
	}

	protected override onMount(): void {
		super.onMount();

		this.listen('focusout', this.handleFocusOut);
		this.listen('keydown', this.handleOpenKeyDown);
	}

	protected override enabled() {
		return this.visible();
	}

	override select(element: HTMLElement, event: Event) {
		super.select(element, event);
		if (!this.props.multiple) {
			this.hide();
		}
	}

	private handleFocusOut(event: FocusEvent) {
		if (!isFocusVisible()) return;
		const relatedTarget = event.relatedTarget as HTMLElement | null;
		if (!relatedTarget) return;
		if (this.node?.contains(relatedTarget)) return;
		if (this.listElm()?.contains(relatedTarget)) return;
		this.hide();
	}

	private handleOpenKeyDown(event: KeyboardEvent) {
		if (
			(event.key.length === 1 || event.key.startsWith('Arrow') || event.key === 'Enter') &&
			!this.visible()
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
	}

	private popover() {
		return this.listElm()?.closest('[popover]') as HTMLElement | null;
	}

	private visible() {
		return !!this.popover()?.matches(':popover-open');
	}

	private hide() {
		this.popover()?.hidePopover();
		if (!this.props.multiple) {
			this.updateActive(null);
		}
	}

	private show() {
		this.popover()?.showPopover();
	}
}
