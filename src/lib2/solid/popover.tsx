/** `Popover` (§13.7) — `c-popover`, an anchor-positioned `[popover]` matching surrounding chrome. */

import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { popover as popoverAttrs } from '~/lib2/dom/components/popover';
import { anchorNameRule, anchorPositionStyle } from '~/lib2/solid/anchor-position';

export interface PopoverProps extends ComponentProps<'div'> {
	id: string;
	/** ID of the anchor element this popover positions against. */
	anchor: string;
}

export function Popover(props: PopoverProps) {
	const [local, rest] = splitProps(props, ['anchor', 'class']);
	return (
		<>
			<style>{anchorNameRule('pop', local.anchor)}</style>
			<div
				{...popoverAttrs()}
				{...rest}
				class={cx('c-popover', local.class)}
				style={anchorPositionStyle('pop', local.anchor, 'bottom')}
			/>
		</>
	);
}
