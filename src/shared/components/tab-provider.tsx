import { createSignal, type JSX } from 'solid-js';

import { TabContext, type TabContextValue } from '~/shared/components/tab-context';

interface TabContextProviderProps {
	/** Active tabId? */
	active?: string | undefined;
	/** Default persistence for all tabs? */
	persist?: boolean | undefined;
	/** Required children */
	children: JSX.Element;
}

export function TabsContextProvider(props: TabContextProviderProps) {
	const [tabIds, setTabIds] = createSignal<string[]>([]);
	const [btnIds, setBtnIds] = createSignal<Record<string, string>>({});

	function add(name: string) {
		setTabIds((prev) => {
			const index = prev.indexOf(name);
			if (index !== -1) return prev;
			return [...prev, name];
		});
	}

	function rm(name: string) {
		setTabIds((prev) => {
			const index = prev.indexOf(name);
			if (index === -1) return prev;
			const newBtnIds = { ...btnIds() };
			delete newBtnIds[name];
			setBtnIds(newBtnIds);
			return prev.slice(0, index).concat(prev.slice(index + 1));
		});
	}

	function btnId(tabId: string) {
		return btnIds()[tabId];
	}

	function setBtnId(tabId: string, id: string) {
		setBtnIds((prev) => ({ ...prev, [tabId]: id }));
	}

	const value: TabContextValue = {
		active: () => {
			const allIds = tabIds();
			const current = props.active;
			if (current !== undefined && allIds.includes(current)) {
				return current;
			}
			return allIds[0];
		},
		add,
		rm,
		tabIds,
		btnId,
		setBtnId,
		persist: () => props.persist,
	};

	return <TabContext.Provider value={value}>{props.children}</TabContext.Provider>;
}
