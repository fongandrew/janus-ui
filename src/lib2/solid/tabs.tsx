/**
 * `Tabs` family (§13.7), built on `dom/components/tabs`'s producers. `Tabs`
 * itself is a plain structural wrapper -- the CSS chrome lives on
 * `c-tabs__list` / `c-tab` / `c-tab__panel`, there is no bare `c-tabs` rule.
 */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { tab, tabList, tabPanel } from '~/lib2/dom/components/tabs';
import { type RovingFocusAxis } from '~/lib2/dom/handlers/t-roving-focus';

export function Tabs(props: ComponentProps<'div'>) {
	return <div {...props} />;
}

export interface TabListProps extends ComponentProps<'div'> {
	axis?: RovingFocusAxis | undefined;
}

export function TabList(props: TabListProps) {
	const [local, rest] = splitProps(props, ['axis', 'class']);
	return (
		<div {...tabList({ axis: local.axis })} {...rest} class={cx('c-tabs__list', local.class)} />
	);
}

export interface TabProps extends ComponentProps<'button'> {
	/** id of the `<TabPanel>` this tab controls. */
	panelId: string;
	selected?: boolean | undefined;
}

export function Tab(props: TabProps) {
	const [local, rest] = splitProps(props, ['panelId', 'selected', 'class']);
	return (
		<button
			type="button"
			{...tab({ panelId: local.panelId, selected: local.selected })}
			{...rest}
			class={cx('c-tab', local.class)}
		/>
	);
}

export interface TabPanelProps extends ComponentProps<'div'> {
	/** id of the `<Tab>` that labels this panel. */
	tabId: string;
	selected?: boolean | undefined;
}

export function TabPanel(props: TabPanelProps) {
	const [local, rest] = splitProps(props, ['tabId', 'selected', 'class']);
	return (
		<div
			{...tabPanel({ tabId: local.tabId, selected: local.selected })}
			{...rest}
			class={cx('c-tab__panel', local.class)}
		/>
	);
}
