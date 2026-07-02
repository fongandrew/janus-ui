/**
 * Tabs (§13.7) — `c-tabs` container providing ids via ordinary context so
 * Tab/TabPanel pair aria-controls/aria-labelledby. Selection at runtime is
 * the DOM layer's job (`t-roving-focus c-tabs__select` on the tablist);
 * the initial render is plain attributes — SSR-friendly, no signals.
 */
import cx from 'classix';
import {
	type ComponentProps,
	createContext,
	createUniqueId,
	splitProps,
	useContext,
} from 'solid-js';

import { ariaize, attrs } from '~/lib2/solid/aria';

interface TabsContextValue {
	id: string;
	defaultValue: string | undefined;
}

const TabsContext = createContext<TabsContextValue>();

function tabId(ctx: TabsContextValue | undefined, value: string): string | undefined {
	return ctx && `${ctx.id}-tab-${value}`;
}

function panelId(ctx: TabsContextValue | undefined, value: string): string | undefined {
	return ctx && `${ctx.id}-panel-${value}`;
}

export interface TabsProps extends ComponentProps<'div'> {
	/** The Tab `value` selected on initial render. */
	defaultValue?: string | undefined;
}

export function Tabs(props: TabsProps) {
	const [local, rest] = splitProps(props, ['defaultValue', 'id', 'class']);
	const fallbackId = createUniqueId();
	const context: TabsContextValue = {
		get id() {
			return local.id ?? fallbackId;
		},
		get defaultValue() {
			return local.defaultValue;
		},
	};
	return (
		<TabsContext.Provider value={context}>
			<div {...rest} id={context.id} class={cx('c-tabs', local.class)} />
		</TabsContext.Provider>
	);
}

export interface TabListProps extends ComponentProps<'div'> {
	'data-js'?: string | undefined;
}

export function TabList(props: TabListProps) {
	const [local, rest] = splitProps(props, ['data-js']);
	return (
		<div
			{...rest}
			role="tablist"
			aria-orientation="horizontal"
			data-js={attrs('t-roving-focus c-tabs__select', local['data-js'])}
		/>
	);
}

export interface TabProps extends ComponentProps<'button'> {
	/** Pairs this tab with the TabPanel of the same value. */
	value: string;
	/** Selected on initial render (or set defaultValue on Tabs). */
	selected?: boolean | undefined;
}

export function Tab(props: TabProps) {
	const ctx = useContext(TabsContext);
	const [local, rest] = splitProps(props, ['value', 'selected', 'disabled']);
	const selected = () => local.selected ?? ctx?.defaultValue === local.value;
	return (
		<button
			type="button"
			{...rest}
			id={tabId(ctx, local.value)}
			role="tab"
			aria-controls={panelId(ctx, local.value)}
			aria-selected={selected() ? 'true' : 'false'}
			{...ariaize({ disabled: local.disabled })}
		/>
	);
}

export interface TabPanelProps extends ComponentProps<'div'> {
	/** Pairs this panel with the Tab of the same value. */
	value: string;
	/** Selected on initial render (or set defaultValue on Tabs). */
	selected?: boolean | undefined;
}

export function TabPanel(props: TabPanelProps) {
	const ctx = useContext(TabsContext);
	const [local, rest] = splitProps(props, ['value', 'selected']);
	const selected = () => local.selected ?? ctx?.defaultValue === local.value;
	return (
		<div
			{...rest}
			id={panelId(ctx, local.value)}
			role="tabpanel"
			aria-labelledby={tabId(ctx, local.value)}
			hidden={!selected()}
		/>
	);
}
