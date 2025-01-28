import cx from 'classix';
import { type JSX } from 'solid-js';

import { type TabContextValue, useTabContext } from '~/shared/components/tab-context';
import { bindCallback } from '~/shared/utility/bound-callbacks';
import { nextIndex } from '~/shared/utility/next-index';
import { bindProp, combineEventHandlers } from '~/shared/utility/solid/combine-event-handlers';

export interface TabBarProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Actual vertical styling isn't supported but might as well stick the logic in */
	orientation?: 'horizontal' | 'vertical';
	/** Automatically activate tab on focus, defaults to true */
	auto?: boolean | undefined;
}

function handleKeyDown([context, props]: [TabContextValue, TabBarProps], event: KeyboardEvent) {
	const tabIds = context.tabIds();
	const currentIndex = Math.max(tabIds.indexOf(context.active() ?? ''), 0);
	const prevKey = props.orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
	const nextKey = props.orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';

	let newIndex: number | undefined;
	switch (event.key) {
		case prevKey:
			event.preventDefault();
			newIndex = nextIndex(tabIds, currentIndex, -1, true);
			break;
		case nextKey:
			event.preventDefault();
			newIndex = nextIndex(tabIds, currentIndex, 1, true);
			break;
		case 'Home':
			event.preventDefault();
			newIndex = 0;
			break;
		case 'End':
			event.preventDefault();
			newIndex = tabIds.length - 1;
			break;
		case 'Enter':
		case ' ': {
			event.preventDefault();
			context.setActive(tabIds[currentIndex]);
			return;
		}
	}

	if (newIndex === undefined) return;
	const tabBar = event.currentTarget as HTMLElement;
	tabBar.querySelectorAll<HTMLElement>(`[role="tab"]`)[newIndex]?.focus();
	if (props.auto !== false) {
		context.setActive(tabIds[newIndex]);
	}
}

function handleClick(context: TabContextValue, event: MouseEvent) {
	const target = event.target as HTMLElement;
	const tab = target.closest('[role="tab"]') as HTMLElement | null;
	const tabId = tab?.getAttribute('aria-controls');
	if (!tabId) return;
	context.setActive(tabId);
}

export function TabBar(props: TabBarProps) {
	const context = useTabContext();
	return (
		<div
			role="tablist"
			aria-orientation={props['aria-orientation'] ?? props.orientation}
			{...props}
			class={cx('c-tabs__bar', props.class)}
			onClick={combineEventHandlers(
				bindCallback(handleClick, context),
				bindProp(props, 'onClick'),
			)}
			onKeyDown={combineEventHandlers(
				bindCallback(handleKeyDown, [context, props]),
				bindProp(props, 'onKeyDown'),
			)}
		>
			{props.children}
		</div>
	);
}
