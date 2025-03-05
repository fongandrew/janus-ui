import cx from 'classix';
import { children, type JSX } from 'solid-js';

import { focusInputOnClick } from '~/shared/handlers/label';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { createAutoId } from '~/shared/utility/solid/auto-prop';
import { spanify } from '~/shared/utility/solid/spanify';

export function Label(props: JSX.HTMLAttributes<HTMLSpanElement>) {
	const id = createAutoId(props);

	const resolved = children(() => props.children);
	return (
		<span
			{...props}
			{...handlerProps(props, focusInputOnClick)}
			id={id()}
			class={cx('c-label', props.class)}
		>
			{
				// Wrap text nodes and strings in spans to make it easier to apply
				// overflow in a way that doesn't result in focus ring clipping
				spanify(resolved.toArray())
			}
		</span>
	);
}
