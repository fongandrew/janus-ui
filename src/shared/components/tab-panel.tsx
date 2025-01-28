import cx from 'classix';
import {
	type Component,
	createMemo,
	createRenderEffect,
	type JSX,
	onCleanup,
	Show,
} from 'solid-js';

import { useTabContext } from '~/shared/components/tab-context';
import { attrs } from '~/shared/utility/attribute-list';

export interface TabPanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ID is required since this is how we connect tab button */
	id: string;
	/**
	 * Persist tab even when not visible, defaults to true.
	 * Note that tabs are lazily rendered, so persistence happens only after first render.
	 */
	persist?: boolean | undefined;
}

export const TabPanel: Component<TabPanelProps> = (props) => {
	const context = useTabContext();
	const visible = () => context.active() === props.id;
	const persist = () => props.persist ?? context.persist() ?? true;
	const mount = createMemo((prev) => {
		if (prev && persist()) return true;
		return visible();
	});

	createRenderEffect(() => {
		context.add(props.id);
		onCleanup(() => context.rm(props.id));
	});

	return (
		<Show when={mount()}>
			<div
				role="tabpanel"
				{...props}
				id={props.id}
				aria-labelledby={attrs(props['aria-labelledby'], context.btnId(props.id))}
				class={cx(props.class, !visible() && 'hidden')}
				tabIndex={0}
			>
				{props.children}
			</div>
		</Show>
	);
};
