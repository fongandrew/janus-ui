import { type Placement } from '@floating-ui/dom';
import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import {
	tooltipBlur,
	tooltipFocus,
	tooltipMouseOut,
	tooltipMouseOver,
} from '~/shared/components/callbacks/tooltip';
import { FormElementButtonPropsProvider } from '~/shared/components/form-element-context';
import { attrs } from '~/shared/utility/attribute-list';
import { callbackAttrMods } from '~/shared/utility/callback-attrs/callback-registry';
import { createAutoId } from '~/shared/utility/solid/auto-prop';

export interface TooltipContentProps extends JSX.HTMLAttributes<HTMLSpanElement> {
	/** Make ID required for `aria-label` purposes */
	id: string;
}

export interface TooltipProps extends JSX.HTMLAttributes<HTMLSpanElement> {
	/** Tooltip placement */
	placement?: Placement | undefined;
	/** Tooltip content */
	tip: JSX.Element;
}

export function TooltipContent(props: TooltipContentProps) {
	return (
		<span role="tooltip" popover="manual" class={cx('c-tooltip', props.class)} {...props}>
			{props.children}
			<span class="c-tooltip__arrow" {...{ [tooltipMouseOver.ARROW_ATTR]: true }} />
		</span>
	);
}

export function Tooltip(props: TooltipProps) {
	const [local, rest] = splitProps(props, ['children', 'tip']);
	const tooltipId = createAutoId(props);

	const mods = {
		'aria-describedby': (prev: string | undefined) => attrs(prev, tooltipId()),
		[tooltipMouseOver.PLACEMENT_ATTR]: () => props.placement,
		...callbackAttrMods(tooltipMouseOver, tooltipMouseOut, tooltipFocus, tooltipBlur),
	};
	return (
		<>
			<FormElementButtonPropsProvider {...mods}>
				{props.children}
			</FormElementButtonPropsProvider>
			<TooltipContent {...rest} id={tooltipId()}>
				{local.tip}
			</TooltipContent>
		</>
	);
}
