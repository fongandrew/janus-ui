import cx from 'classix';
import { children, type ComponentProps, splitProps } from 'solid-js';

import { focusInputOnClick } from '~/lib/components/callbacks/label';
import { useFormElementProps } from '~/lib/components/form-element-context';
import { Tooltip } from '~/lib/components/tooltip';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import { useT } from '~/lib/utility/solid/locale-context';
import { spanify } from '~/lib/utility/solid/spanify';

/**
 * Default HTML label component, used primarily for inline inputs. Generally prefer
 * using LabelledInput and LabelledInline over using this directly.
 */
export function Label(props: ComponentProps<'label'> & { required?: boolean | undefined }) {
	const [local, rest] = splitProps(props, ['required']);
	const resolved = children(() => props.children);
	return (
		<label {...(rest as ComponentProps<'label'>)} class={cx('c-label', props.class)}>
			{
				// Wrap text nodes and strings in spans to make it easier to apply
				// overflow in a way that doesn't result in focus ring clipping
				spanify(resolved.toArray())
			}
			{local.required && <RequiredAsterisk />}
		</label>
	);
}

/**
 * Variant meant for use with block-level elements and cases where we're not
 * quite sure whether the element labelled is a proper HTML input and therefore
 * must be linked via aria-labelledby.
 */
export function LabelSpan(
	props: ComponentProps<'span'> & {
		id: string;
		required?: boolean | undefined;
		focusOnClick?: boolean | undefined;
	},
) {
	const [local, rest] = splitProps(props, ['required']);
	const resolved = children(() => props.children);
	return (
		<span
			{...rest}
			{...callbackAttrs(props, props.focusOnClick !== false && focusInputOnClick)}
			class={cx('c-label', props.class)}
		>
			{
				// Wrap text nodes and strings in spans to make it easier to apply
				// overflow in a way that doesn't result in focus ring clipping
				spanify(resolved.toArray())
			}
			{local.required && <RequiredAsterisk />}
		</span>
	);
}

/**
 * Asterisk to mark label as required
 */
export function RequiredAsterisk() {
	const t = useT();
	return (
		<Tooltip tip={t`Required`}>
			<span
				class="c-label__required"
				{...useFormElementProps({
					// aria-hidden because underlying element should have aria-required
					'aria-hidden': true,
				})}
			>
				*
			</span>
		</Tooltip>
	);
}
