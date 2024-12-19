import { createContext } from 'solid-js';

import { normalizeText } from '~/shared/utility/normalize-text';

export interface OptionListContextValue {
	/** Map from values (which function as keys) to refs */
	refs: Map<string, HTMLElement>;
	/** Map from values to searchable text. Should be normalized before setting. */
	text: Map<string, string>;
	/** Signal for currently highlighted option */
	activeValue: () => string | undefined;
	/** Signal for currently selected option(s) */
	selectedValues: () => Set<string>;
}

/** Solid context to establish communication between parent and child components */
export const OptionListContext = createContext<OptionListContextValue>();

/** Create a new context value */
export function createOptionListContextValue(
	getActiveValue: () => string | undefined,
	getSelectedValues: () => Set<string>,
): OptionListContextValue {
	return {
		refs: new Map(),
		text: new Map(),
		activeValue: getActiveValue,
		selectedValues: getSelectedValues,
	};
}

/**
 * This is used for partial text matching in the option list. It returns a function that
 * takes an additional character (e.g. from a keydown event). If typed within a customizable
 * delay period, the character is appended to the current text and the matcher checks if any
 * existing option text includes the current text. Returns the matching label and referenced
 * element.
 */
export function createOptionListTextMatcher(
	optionListContextValue: OptionListContextValue,
	delay = 500,
) {
	let current = '';
	let lastMatchTime = 0;
	return (value: string) => {
		const now = Date.now();
		current = now - lastMatchTime < delay ? `${current}${value}` : value;
		lastMatchTime = now;

		const currentNormalized = normalizeText(current);
		for (const [label, text] of optionListContextValue.text) {
			if (text.includes(currentNormalized)) {
				const ref = optionListContextValue.refs.get(label);
				if (ref) {
					return [label, ref] as const;
				}
			}
		}

		// No match: Return array of nulls for ease of destructuring
		return [null, null] as const;
	};
}
