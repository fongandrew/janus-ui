import { OptionListControl } from '~/shared/utility/controls/option-list-control';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';

/**
 * Behavior for something with a menu role. Adds effects and aria- props.
 */
export class MenuControl extends OptionListControl {
	protected matchText = createTextMatcher(() => this.items());

	override onMount() {
		super.onMount();
		this.listen('keydown', this.handleMenuKeyDown);

		if (!this.listElm()?.querySelector('[autofocus]')) {
			const first = this.items()[0];
			if (first) {
				first.autofocus = true;
			}
		}
	}

	override highlight(element: HTMLElement | null, event: Event) {
		super.highlight(element, event);
		element?.focus();
	}

	override select(element: HTMLElement | null, event: Event): void {
		super.select(element, event);
		this.popover()?.hidePopover();
	}

	private popover() {
		return this.node.closest('[popover]') as HTMLElement | null;
	}

	/** Specific arrow key actions for a menu in a popover */
	private handleMenuKeyDown(event: KeyboardEvent) {
		switch (event.key) {
			// Arrow keys handled by OptionListControl
			// Escape key handled by poopver light dismiss

			case 'Tab': {
				// We're assuming menu is in a popover right after the trigger so the
				// tab sequence will naturally go to the right thing. This might do
				// weird things in a portal though. Consider passing a reference
				// to the trigger to menu so we can correctly focus it.
				this.popover()?.hidePopover();
				break;
			}

			default: {
				// If here, check if we're typing a character to filter the list
				if (event.key.length === 1) {
					const node = this.matchText(event.key);
					this.highlight(node, event);
				}
			}
		}
	}
}
