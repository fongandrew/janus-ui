import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface TabsProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function Tabs(props: TabsProps) {
	const [local, rest] = splitProps(props, ['class']);
	return <div class={attrs('c-tabs', local.class)} {...rest} />;
}

export interface TabListProps extends JSX.HTMLAttributes<HTMLDivElement> {}

export function TabList(props: TabListProps) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			class={attrs('c-tabs__list', local.class)}
			role="tablist"
			data-js="t-roving-focus c-tabs__select"
			aria-orientation="horizontal"
			{...rest}
		/>
	);
}

export interface TabProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	selected?: boolean;
	controls: string;
}

export function Tab(props: TabProps) {
	const [local, rest] = splitProps(props, ['selected', 'controls', 'class']);
	return (
		<button
			class={attrs('c-tabs__tab', local.class)}
			role="tab"
			aria-selected={local.selected ? 'true' : 'false'}
			aria-controls={local.controls}
			tabindex={local.selected ? '0' : '-1'}
			{...rest}
		/>
	);
}

export interface TabPanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
	labelledBy?: string;
}

export function TabPanel(props: TabPanelProps) {
	const [local, rest] = splitProps(props, ['class', 'labelledBy', 'hidden']);
	return (
		<div
			class={attrs('c-tabs__panel', local.class)}
			role="tabpanel"
			aria-labelledby={local.labelledBy}
			hidden={local.hidden}
			tabindex="0"
			{...rest}
		/>
	);
}
