import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

/**
 * Tabs (§10.2). Selection is driven by the DOM layer's `c-tabs__select`
 * behavior (and `t-roving-focus` for arrow-key nav); the components render only
 * the initial ARIA state and structure.
 */

/** Container wrapping a `TabList` and its `TabPanel`s. */
export function Tabs(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return <div {...rest} class={cx('c-tabs', local.class)} />;
}

/** The `role="tablist"` strip carrying the tab buttons. */
export function TabList(props: ComponentProps<'div'>) {
	const [local, rest] = splitProps(props, ['class']);
	return (
		<div
			{...rest}
			role="tablist"
			aria-orientation="horizontal"
			data-js="t-roving-focus c-tabs__select"
			class={cx('c-tabs__list', local.class)}
		/>
	);
}

export interface TabProps extends ComponentProps<'button'> {
	selected?: boolean;
	/** `id` of the `TabPanel` this tab controls. */
	controls: string;
}

/** A single `role="tab"` button. */
export function Tab(props: TabProps) {
	const [local, rest] = splitProps(props, ['selected', 'controls', 'class']);
	return (
		<button
			{...rest}
			type="button"
			role="tab"
			aria-selected={local.selected ? 'true' : 'false'}
			aria-controls={local.controls}
			class={cx('c-tab', local.class)}
		/>
	);
}

export interface TabPanelProps extends ComponentProps<'div'> {
	active?: boolean;
	/** `id` of the `Tab` that labels this panel. */
	labelledby: string;
}

/** A `role="tabpanel"`, hidden unless `active`. */
export function TabPanel(props: TabPanelProps) {
	const [local, rest] = splitProps(props, ['active', 'labelledby', 'class']);
	return (
		<div
			{...rest}
			role="tabpanel"
			aria-labelledby={local.labelledby}
			hidden={!local.active}
			class={cx('c-tab-panel', local.class)}
		/>
	);
}
