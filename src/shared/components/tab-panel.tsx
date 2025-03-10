import cx from 'classix';
import {
	createMemo,
	createRenderEffect,
	createSignal,
	createUniqueId,
	type JSX,
	onCleanup,
	Show,
} from 'solid-js';
import { isServer } from 'solid-js/web';

import { useTabContext } from '~/shared/components/tab-context';
import { attrs } from '~/shared/utility/attribute-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import {
	createAfterHideCallback,
	createBeforeShowCallback,
} from '~/shared/utility/callback-attrs/visibility';

export interface TabPanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** ID is required since this is how we connect tab button */
	id: string;
	/**
	 * Persist tab even when not visible, defaults to true.
	 * Note that tabs are lazily rendered, so persistence happens only after first render.
	 */
	persist?: boolean | undefined;
}

export function TabPanel(props: TabPanelProps) {
	const context = useTabContext();
	createRenderEffect(() => {
		context.add(props.id);
		onCleanup(() => context.rm(props.id));
	});

	// Lazily mount when needed
	const [mount, setMount] = createSignal(isServer);
	const visible = () => context.active() === props.id;
	const persist = () => props.persist ?? context.persist() ?? true;
	createRenderEffect(() => {
		if (visible()) {
			setMount(true);
		} else if (!persist()) {
			setMount(false);
		}
	});

	// Duplicates the above logic but relies on event handler attrs so this works outside
	// of a framework. This should also play nice with framework code regardless of whether
	// visible() updates reactively or not.
	const beforeShow = createMemo(() =>
		createBeforeShowCallback(createUniqueId(), () => setMount(true)),
	);
	const afterHide = createMemo(() =>
		createAfterHideCallback(createUniqueId(), () => !persist() && setMount(false)),
	);

	return (
		<div
			role="tabpanel"
			tabIndex={visible() ? 0 : -1}
			aria-hidden={!visible()}
			{...props}
			{...callbackAttrs(props, beforeShow(), afterHide())}
			class={cx('c-tabs__panel', props.class)}
			aria-labelledby={attrs(props['aria-labelledby'], context.btnId(props.id))}
		>
			<Show when={mount()}>{props.children}</Show>
		</div>
	);
}
