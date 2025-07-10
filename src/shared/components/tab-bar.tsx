import cx from 'classix';
import { type ComponentProps } from 'solid-js';

import { tabClick, tabKeyDown } from '~/shared/components/callbacks/tabs';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';

export interface TabBarProps extends ComponentProps<'div'> {
	/** Automatically activate tab on focus, defaults to true */
	auto?: boolean | undefined;
	/** Callback on tab change */
	onTabChange?: ((tabId: string, event: Event) => void) | undefined;
	/** Actual vertical styling isn't supported but might as well stick the logic in */
	orientation?: 'horizontal' | 'vertical';
}

export function TabBar(props: TabBarProps) {
	return (
		<div
			role="tablist"
			aria-orientation={props.orientation}
			{...props}
			{...callbackAttrs(tabKeyDown(props.auto !== false ? 'auto' : 'manual'), tabClick)}
			class={cx('c-tabs__bar', props.class)}
		>
			{props.children}
		</div>
	);
}
