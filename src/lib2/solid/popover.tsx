/**
 * `Popover` (§13.7). An anchor-positioned `[popover]` matching surrounding chrome.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

export interface PopoverProps extends Omit<ComponentProps<'div'>, 'id'> {
	id: string;
	/** ID of the anchor element. */
	anchor?: string;
}

export function Popover(props: PopoverProps) {
	const [local, rest] = splitProps(props, ['anchor', 'class', 'style']);
	return (
		<div
			{...rest}
			popover="auto"
			data-js="t-request-close"
			class={cx('c-popover', local.class)}
			style={{
				...(typeof local.style === 'object' ? local.style : {}),
				...(local.anchor ? { 'position-anchor': `--${local.anchor}` } : {}),
			}}
		/>
	);
}
