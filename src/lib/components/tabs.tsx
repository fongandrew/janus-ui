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

import { TabBar } from '~/lib/components/tab-bar';
import { TabButton } from '~/lib/components/tab-button';
import { TabPanel, type TabPanelProps } from '~/lib/components/tab-panel';
import { TabsContextProvider } from '~/lib/components/tab-provider';
import { createAutoId } from '~/lib/utility/solid/auto-prop';

export interface TabsProps {
	/** Whether to enable automatic tab switching. Defaults to true. */
	auto?: boolean | undefined;
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
 *
 * @example
 * ```tsx
 * // Basic tabs with automatic tab switching
 * 	<Tabs>
 * 		<Tab label="Tab 1">
 * 			<div>Content for Tab 1</div>
 * 		</Tab>
 * 		<Tab label="Tab 2">
 * 			<div>Content for Tab 2</div>
 * 		</Tab>
 * 		<Tab label="Tab 3">
 * 			<div>Content for Tab 3</div>
 * 		</Tab>
 * 	</Tabs>
 * ```
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
				<TabBar auto={props.auto}>
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
 * A single Tab with a button label and content
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
