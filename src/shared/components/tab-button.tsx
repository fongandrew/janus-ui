import cx from 'classix';
import { children, createRenderEffect, type JSX, onCleanup } from 'solid-js';

import { useTabContext } from '~/shared/components/tab-context';
import { createAutoId } from '~/shared/utility/solid/auto-prop';
import { spanify } from '~/shared/utility/solid/spanify';

interface TabButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Should match ID attribute on tab */
	tabId: string;
}

/** A button for switching to a tab */
export function TabButton(props: TabButtonProps) {
	const context = useTabContext();
	const isSelected = () => context.active() === props.tabId;

	const id = createAutoId(props);
	createRenderEffect(() => {
		context.add(props.tabId);
		context.setBtnId(props.tabId, id());
		onCleanup(() => context.rm(props.tabId));
	});

	const resolved = children(() => props.children);

	// No handlers, they're on the tab bar instead
	return (
		<button
			{...props}
			id={id()}
			role="tab"
			aria-controls={props.tabId}
			aria-selected={isSelected()}
			tabIndex={isSelected() ? 0 : -1}
			class={cx('c-tabs__button', props.class)}
		>
			<span class="c-tabs__button-content">{spanify(resolved.toArray())}</span>
		</button>
	);
}
