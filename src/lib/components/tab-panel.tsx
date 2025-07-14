import cx from 'classix';
import {
	type ComponentProps,
	createMemo,
	createRenderEffect,
	createSignal,
	createUniqueId,
	Show,
} from 'solid-js';
import { isServer } from 'solid-js/web';

import { useTabContext } from '~/lib/components/tab-context';
import { attrs } from '~/lib/utility/attribute-list';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import {
	createAfterHideCallback,
	createBeforeShowCallback,
} from '~/lib/utility/callback-attrs/display';
import { useLogger } from '~/lib/utility/solid/use-logger';

export interface TabPanelProps extends ComponentProps<'div'> {
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

	// Lazily mount when needed -- note that we assume we've rendered the tab bar
	// already and thus tab IDs are already registered. If not, we will need
	// to call context.add on the first possibly visible tabId.
	const [mount, setMount] = createSignal(isServer);
	const visible = () => context.active() === props.id;
	const persist = () => {
		const ret = props.persist ?? context.persist() ?? true;
		if (isServer && !ret) {
			useLogger().warn('persist=false does not work on server');
			return true;
		}
		return ret;
	};

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
