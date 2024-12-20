import { createContext } from 'solid-js';

export interface OptionListContextValue {
	/** Signal for currently highlighted option */
	activeId: () => string | undefined;
	/** Signal for currently selected option(s) */
	selectedValues: () => Set<string>;
}

/** Solid context to establish communication between parent and child components */
export const OptionListContext = createContext<OptionListContextValue>();
