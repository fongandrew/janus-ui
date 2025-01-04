import { type Placement } from '@floating-ui/dom';
import { type JSX, splitProps } from 'solid-js';

import { createTooltip, TOOLTIP_ARROW_ATTR } from '~/shared/components/create-tooltip';
import { FormControlRef } from '~/shared/components/form-control-ref';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

export interface TooltipContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Ref returned by createTooltip */
	ref: (el: HTMLDivElement) => void;
	/** Make children required */
	children: JSX.Element;
}

export interface TooltipProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Must be callback ref if any */
	ref?: (el: HTMLDivElement) => void;
	/** Tooltip placement */
	placement?: Placement | undefined;
	/** Tooltip content */
	tip: JSX.Element;
	/** Make children required */
	children: JSX.Element;
}

export function TooltipContent(props: TooltipContentProps) {
	return (
		<div ref={props.ref} class="c-tooltip" role="tooltip">
			{props.children}
			<div class="c-tooltip__arrow" {...{ [TOOLTIP_ARROW_ATTR]: true }} />
		</div>
	);
}

export function Tooltip(props: TooltipProps) {
	const [local, rest] = splitProps(props, ['children', 'placement', 'tip']);
	const [setTrigger, setContent] = createTooltip(props);
	return (
		<>
			<FormControlRef ref={setTrigger}>{local.children}</FormControlRef>
			<TooltipContent {...rest} ref={combineRefs(setContent, rest.ref)}>
				{local.tip}
			</TooltipContent>
		</>
	);
}
