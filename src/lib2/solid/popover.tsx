/**
 * Popover (§13.7) — anchor-positioned `[popover]` (`c-popover`). The
 * trigger sets `anchor-name: --popover-anchor` (the name c-popover tracks)
 * and `popovertarget={id}`.
 */
import cx from 'classix';
import { type ComponentProps, splitProps } from 'solid-js';

import { attrs } from '~/lib2/solid/aria';

export interface PopoverProps extends ComponentProps<'div'> {
	/** Required so popovertarget triggers can target it. */
	id: string;
	/** Custom anchor-name (e.g. "--my-anchor") when the default is taken. */
	anchor?: string | undefined;
	'data-js'?: string | undefined;
}

export function Popover(props: PopoverProps) {
	const [local, rest] = splitProps(props, ['anchor', 'class', 'data-js', 'style']);
	return (
		<div
			{...rest}
			popover
			class={cx('c-popover', local.class)}
			data-js={attrs('t-request-close t-restore-focus', local['data-js'])}
			style={{
				...(typeof local.style === 'object' ? local.style : {}),
				...(local.anchor ? { 'position-anchor': local.anchor } : {}),
			}}
		/>
	);
}
