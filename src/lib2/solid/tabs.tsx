/**
 * `Tabs` family (§13.7). `TabList` carries the roving-focus + selection behaviors;
 * `Tab` renders `[role="tab"]`; `TabPanel` renders `[role="tabpanel"]`, hidden when
 * inactive. Selection sync (aria-selected + panel visibility) is DOM-driven via
 * `c-tabs__select`.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export function Tabs(props: ComponentProps<'div'>) {
	return <div {...props} />;
}

export function TabList(props: ComponentProps<'div'>) {
	return (
		<div
			{...props}
			role="tablist"
			data-js="t-roving-focus c-tabs__select"
			class={cx('c-tabs__list', props.class)}
		/>
	);
}

export interface TabProps extends Omit<ComponentProps<'button'>, 'disabled'> {
	/** ID of the `TabPanel` this tab controls. */
	controls: string;
	selected?: boolean;
	disabled?: boolean;
}

export function Tab(props: TabProps) {
	const [local, rest] = splitProps(props, ['controls', 'selected', 'disabled', 'class']);
	return (
		<button
			type="button"
			{...rest}
			role="tab"
			aria-controls={local.controls}
			aria-selected={local.selected ? 'true' : 'false'}
			aria-disabled={local.disabled || undefined}
			class={cx('c-tab', local.class)}
		/>
	);
}

export interface TabPanelProps extends ComponentProps<'div'> {
	/** ID of the `Tab` that labels this panel. */
	labelledby: string;
	selected?: boolean;
}

export function TabPanel(props: TabPanelProps) {
	const [local, rest] = splitProps(props, ['labelledby', 'selected', 'class']);
	return (
		<div
			{...rest}
			role="tabpanel"
			aria-labelledby={local.labelledby}
			hidden={!local.selected}
			class={cx('c-tab__panel', local.class)}
		/>
	);
}
