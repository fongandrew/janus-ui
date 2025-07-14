import { isTextInput } from '~/lib/utility/element-types';

/**
 * Util to focus an element and highlight text if applicable
 */
export function focusAndSelect(elm: HTMLElement) {
	elm.focus();
	if (isTextInput(elm)) {
		elm.select();
	}
}
