import { type Placement } from '@floating-ui/dom';
import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

import {
	tooltipBlur,
	tooltipFocus,
	tooltipMouseOut,
	tooltipMouseOver,
} from '~/lib/components/callbacks/tooltip';
import { FormElementButtonPropsProvider } from '~/lib/components/form-element-context';
import { attrs } from '~/lib/utility/attribute-list';
import { callbackAttrMods } from '~/lib/utility/callback-attrs/callback-registry';
import { createAutoId } from '~/lib/utility/solid/auto-prop';

export interface TooltipContentProps extends ComponentProps<'span'> {
	/** Make ID required for `aria-label` purposes */
	id: string;
}

export interface TooltipProps extends ComponentProps<'span'> {
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

/**
 * Tooltip component that displays information on hover
 *
 * @example
 * ```tsx
 * // Basic tooltip with default placement
 * 	<Tooltip tip="This is a tooltip">
 * 		<Button>Hover me</Button>
 * 	</Tooltip>
 *
 * // With specific placement
 * 	<Tooltip tip="Appears below" placement="bottom">
 * 		<Button>Bottom tooltip</Button>
 * 	</Tooltip>
 * ```
 */
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
