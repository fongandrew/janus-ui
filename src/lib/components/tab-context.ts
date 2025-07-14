import { type Accessor, createContext, useContext } from 'solid-js';

export interface TabContextValue {
	/**
	 * Get the name of the currently active tab (as determined by props).
	 * Script handlers may change this independently.
	 */
	active: Accessor<string | undefined>;
	/** Add a tab if component mounted */
	add: (id: string) => void;
	/** Remove a tab if component unmounted */
	rm: (id: string) => void;
	/** List IDs of ordered tabs */
	tabIds: () => string[];
	/** Get button ID for a given tab ID */
	btnId: (tabId: string) => string | undefined;
	/** Set button ID for a given tab ID */
	setBtnId: (tabId: string, id: string) => void;
	/** Default persistence for tabs? Can be overridden on a per tab basis. */
	persist: () => boolean | undefined;
}

export const TabContext = createContext<TabContextValue>();

export function useTabContext() {
	const context = useContext(TabContext);
	if (!context) {
		throw new Error('useTabContext must be used within a TabContextProvider');
	}
	return context;
}
