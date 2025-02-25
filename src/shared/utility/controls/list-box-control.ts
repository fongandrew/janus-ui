import { ListBoxBaseControl } from '~/shared/utility/controls/list-box-base-control';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';

/**
 * ListBoxBaseControl with text matcher attached
 */
export class ListBoxControl extends ListBoxBaseControl {
	protected matchText = createTextMatcher(() => this.items());

	override onMount() {
		super.onMount();
		this.listen('keydown', this.handleMenuKeyDown);
	}

	/** Specific arrow key actions for a menu in a popover */
	private handleMenuKeyDown(event: KeyboardEvent) {
		// If here, check if we're typing a character to filter the list
		if (event.key.length === 1) {
			const node = this.matchText(event.key);
			this.highlight(node, event);
		}
	}
}
