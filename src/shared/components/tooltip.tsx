import { type Placement } from '@floating-ui/dom';
import cx from 'classix';
import { createMemo, type JSX, splitProps } from 'solid-js';
import { createUniqueId } from 'solid-js';

import {
	tooltipBlur,
	tooltipFocus,
	tooltipMouseOut,
	tooltipMouseOver,
} from '~/shared/handlers/tooltip';
import { handlerProps } from '~/shared/utility/event-handler-attrs';
import { type RequiredNonNullable } from '~/shared/utility/type-helpers';

export const TOOLTIP_ARROW_ATTR = 'data-tooltip-arrow';

export type TooltipTriggerRenderProps = RequiredNonNullable<
	Pick<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-describedby'>
> & { [tooltipMouseOver.PLACEMENT_ATTR]: Placement | undefined };

export interface TooltipContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Make ID required for `aria-label` purposes */
	id: string;
	/** Make children required */
	children: JSX.Element;
}

export interface TooltipProps extends Omit<TooltipContentProps, 'children'> {
	/** Tooltip placement */
	placement?: Placement | undefined;
	/** Tooltip content */
	tip: JSX.Element;
	/** Render func for trigger as child */
	children: (props: TooltipTriggerRenderProps) => JSX.Element;
}

export function TooltipContent(props: TooltipContentProps) {
	return (
		<div role="tooltip" popover="manual" class={cx('c-tooltip', props.class)} {...props}>
			{props.children}
			<div class="c-tooltip__arrow" {...{ [tooltipMouseOver.ARROW_ATTR]: true }} />
		</div>
	);
}

export function Tooltip(props: TooltipProps) {
	const [local, rest] = splitProps(props, ['children', 'tip']);
	const tooltipId = createMemo(() => props.id || createUniqueId());
	return (
		<>
			{local.children({
				'aria-describedby': tooltipId(),
				[tooltipMouseOver.PLACEMENT_ATTR]: props.placement,
				...handlerProps(tooltipMouseOver, tooltipMouseOut, tooltipFocus, tooltipBlur),
			})}
			<TooltipContent {...rest} id={tooltipId()}>
				{local.tip}
			</TooltipContent>
		</>
	);
}
