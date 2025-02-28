import { isTextInput } from '~/shared/utility/element-types';
import { createHandler } from '~/shared/utility/event-handler-attrs';

/** Clear input on keydown (if applicable) */
export const comboBoxClearInput = createHandler('keydown', 'combo-box__clear-input', (event) => {
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
});
