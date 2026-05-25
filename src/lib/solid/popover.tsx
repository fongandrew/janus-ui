import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface PopoverProps extends JSX.HTMLAttributes<HTMLDivElement> {
	anchor?: string;
}

export function Popover(props: PopoverProps) {
	const [local, rest] = splitProps(props, ['anchor', 'class', 'children']);
	return (
		<div
			class={attrs('c-popover v-colors-popover', local.class)}
			popover="auto"
			data-js="t-request-close t-restore-focus"
			style={local.anchor ? `position-anchor: --${local.anchor}` : undefined}
			{...rest}
		>
			{local.children}
		</div>
	);
}
