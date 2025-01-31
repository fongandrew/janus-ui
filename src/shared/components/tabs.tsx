import '~/shared/components/tabs.css';

import {
	type Accessor,
	createContext,
	createSignal,
	type JSX,
	mapArray,
	onCleanup,
	splitProps,
	useContext,
} from 'solid-js';

import { TabBar } from '~/shared/components/tab-bar';
import { TabButton } from '~/shared/components/tab-button';
import { TabPanel, type TabPanelProps } from '~/shared/components/tab-panel';
import { TabsContextProvider } from '~/shared/components/tab-provider';
import { createAutoId } from '~/shared/utility/solid/auto-prop';

export interface TabsProps {
	/** Whether to enable tab content persistence */
	persist?: boolean | undefined;
	/** Children (should be Tabs and things in tabs bar) */
	children: JSX.Element;
}

export interface TabProps extends Omit<TabPanelProps, 'id'> {
	/** ID is optional here since component represents both tab and button */
	id?: string | null | undefined;
	/** Button label */
	label: JSX.Element;
}

/** Separate context for an automatically ordered list of tabs + buttons */
const TabListContext = createContext<
	readonly [
		Accessor<(() => JSX.Element)[]>,
		{
			add: (tab: () => JSX.Element) => void;
			rm: (tab: () => JSX.Element) => void;
		},
	]
>();

function useTabList() {
	const context = useContext(TabListContext);
	if (!context) {
		throw new Error('useTabList must be used within a TabListProvider');
	}
	return context;
}

/**
 * Convenience function for rendering tabs with matching tab buttons
 */
export function Tabs(props: TabsProps) {
	const [tabList, setTabList] = createSignal<(() => JSX.Element)[]>([]);
	const add = (tab: () => JSX.Element) => setTabList((prev) => [...prev, tab]);
	const rm = (tab: () => JSX.Element) =>
		setTabList((prev) => {
			const index = prev.lastIndexOf(tab);
			if (index === -1) return prev;
			return prev.slice(0, index).concat(prev.slice(index + 1));
		});
	const context = [tabList, { add, rm }] as const;

	return (
		<TabsContextProvider persist={props.persist}>
			<TabListContext.Provider value={context}>
				<TabBar>
					{/*
                            Although children are `Tab` component, render within bar since the
                            `Tab` component renders buttons. Also makes it simple to add
                            additional elements to beginning or end of tab list.
                        */}
					{props.children}
				</TabBar>
				{mapArray(tabList, (tab) => tab())()}
			</TabListContext.Provider>
		</TabsContextProvider>
	);
}

/**
 * A single Tab with a button label
 */
export function Tab(props: TabProps) {
	const [local, rest] = splitProps(props, ['label']);
	const tabId = createAutoId(props);

	const [, { add, rm }] = useTabList();
	const renderPanel = () => <TabPanel {...rest} id={tabId()} />;
	add(renderPanel);
	onCleanup(() => rm(renderPanel));

	return <TabButton tabId={tabId()}>{local.label}</TabButton>;
}
