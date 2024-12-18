import { type JSX } from 'solid-js';

import { TOOLTIP_ARROW_ATTR } from '~/shared/components/create-tooltip';

export interface TooltipProps extends JSX.IntrinsicAttributes, JSX.HTMLAttributes<HTMLDivElement> {
	/** Ref returned by createTooltip */
	ref: (el: HTMLDivElement) => void;
}

export function Tooltip(props: TooltipProps) {
	return (
		<div ref={props.ref} class="c-tooltip" role="tooltip">
			{props.children}
			<div class="c-tooltip__arrow" {...{ [TOOLTIP_ARROW_ATTR]: true }} />
		</div>
	);
}
