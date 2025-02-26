import { SelectBaseControl } from '~/shared/utility/controls/select-base-control';
import { createTextMatcher } from '~/shared/utility/create-text-matcher';
/**
 * UI handling for a select input with just a button trigger
 */
export class SelectControl extends SelectBaseControl {
	protected matchText = createTextMatcher(() => this.items());

	protected override onMount(): void {
		super.onMount();
		this.listen('keydown', this.handleTypingKeyDown);
	}

	private handleTypingKeyDown(event: KeyboardEvent) {
		// Check if we're typing a character to filter the list and force the list open too.
		if (event.key.length === 1) {
			const node = this.matchText(event.key);
			this.highlight(node, event);
		}
	}
}
