import cx from 'classix';
import { children, type JSX } from 'solid-js';

import { focusInputOnClick } from '~/shared/handlers/label';
import { callbackAttrs } from '~/shared/utility/callback-registry';
import { spanify } from '~/shared/utility/solid/spanify';

/** Default HTML label -- used for inline stuff mostly */
export function Label(props: JSX.LabelHTMLAttributes<HTMLLabelElement>) {
	const resolved = children(() => props.children);
	return (
		<label
			{...(props as JSX.LabelHTMLAttributes<HTMLLabelElement>)}
			class={cx('c-label', props.class)}
		>
			{
				// Wrap text nodes and strings in spans to make it easier to apply
				// overflow in a way that doesn't result in focus ring clipping
				spanify(resolved.toArray())
			}
		</label>
	);
}

/**
 * Variant meant for use with block-level elements and cases where we're not
 * quite sure whether the element labelled is a proper HTML input and therefore
 * must be linked via aria-labelledby.
 */
export function LabelSpan(props: JSX.HTMLAttributes<HTMLSpanElement> & { id: string }) {
	const resolved = children(() => props.children);
	return (
		<span
			{...props}
			{...callbackAttrs(props, focusInputOnClick)}
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
