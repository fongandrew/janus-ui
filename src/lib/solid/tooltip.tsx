import { type JSX, splitProps } from 'solid-js';

import { attrs } from './aria';

export interface TooltipProps extends JSX.HTMLAttributes<HTMLDivElement> {
	content: JSX.Element;
	anchor: string;
}

export function Tooltip(props: TooltipProps) {
	const [local, rest] = splitProps(props, ['content', 'anchor', 'class', 'children']);
	return (
		<>
			{local.children}
			<div
				class={attrs('c-tooltip v-colors-tooltip', local.class)}
				popover="auto"
				style={`position-anchor: --${local.anchor}`}
				{...rest}
			>
				{local.content}
			</div>
		</>
	);
}
