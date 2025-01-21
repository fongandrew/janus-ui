import {
	arrow,
	autoUpdate,
	computePosition,
	flip,
	type Middleware,
	offset,
	type Placement,
	shift,
	type Side,
} from '@floating-ui/dom';
import cx from 'classix';
import { createMemo, type JSX, splitProps } from 'solid-js';
import { createEffect, createSignal, onCleanup } from 'solid-js';

import { type FormElementControl } from '~/shared/components/form-element-control';
import { FormElementProvider } from '~/shared/components/form-element-provider';
import { generateId } from '~/shared/utility/id-generator';
import { combineRefs } from '~/shared/utility/solid/combine-refs';

export const TOOLTIP_ARROW_ATTR = 'data-tooltip-arrow';

// Used below to position arrow
const sideToStaticSide: Record<Side, Side> = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left',
};

export interface TooltipContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Make children required */
	children: JSX.Element;
}

export interface TooltipProps extends TooltipContentProps {
	/** Tooltip placement */
	placement?: Placement | undefined;
	/** Tooltip content */
	tip: JSX.Element;
}

export function TooltipContent(props: TooltipContentProps) {
	return (
		<div role="tooltip" popover="manual" class={cx('c-tooltip', props.class)} {...props}>
			{props.children}
			<div class="c-tooltip__arrow" {...{ [TOOLTIP_ARROW_ATTR]: true }} />
		</div>
	);
}

export function Tooltip(props: TooltipProps) {
	const [local, rest] = splitProps(props, ['children', 'tip']);

	const [tooltip, setTooltip] = createSignal<HTMLDivElement | undefined>(undefined);
	const [trigger, setTrigger] = createSignal<HTMLDivElement | undefined>(undefined);
	const [visible, setVisible] = createSignal(false);

	// Callback for updating position
	const updatePosition = async () => {
		const triggerElm = trigger();
		if (!triggerElm) return;

		const tooltipElm = tooltip();
		if (!tooltipElm) return;

		const middleware: Middleware[] = [offset(8), flip()];
		const arrowElm = tooltipElm.querySelector(`[${TOOLTIP_ARROW_ATTR}]`) as HTMLElement | null;
		if (arrowElm) {
			middleware.push(arrow({ element: arrowElm }));
		}
		middleware.push(shift({ padding: 8 }));

		const { x, y, placement, middlewareData } = await computePosition(triggerElm, tooltipElm, {
			placement: props.placement ?? 'top',
			middleware,
			strategy: 'fixed',
		});

		Object.assign(tooltipElm.style, {
			position: 'fixed',
			inset: 'unset', // Clear popover positioning
			left: `${x}px`,
			top: `${y}px`,
		});

		if (arrowElm && middlewareData.arrow) {
			const side = placement.split('-')[0] as Side;
			const staticSide = sideToStaticSide[side] ?? 'bottom';
			Object.assign(arrowElm.style, {
				position: 'absolute',
				left: `${middlewareData.arrow.x}px`,
				top: `${middlewareData.arrow.y}px`,
				[staticSide]: 'calc(var(--tooltip-arrow-size) / -2)',
			});
		}
	};

	// Main effect for showing + positioning tooltip
	createEffect(() => {
		const triggerElm = trigger();
		if (!triggerElm) return;

		const tooltipElm = tooltip();
		if (!tooltipElm) return;

		// Hide tooltip when not visible
		if (!visible()) {
			tooltipElm.hidePopover();
			return;
		}

		// Tooltip is visible. We allow only one tooltip at a time so check other
		// stuck elements.
		for (const otherTooltip of tooltipElm.ownerDocument.querySelectorAll(
			'[role="tooltip"]:popover-open',
		)) {
			(otherTooltip as HTMLElement).hidePopover();
		}

		// Do initial position update, then update automatically when
		// scroll or resize events occur.
		tooltipElm.showPopover();
		updatePosition();
		const cleanup = autoUpdate(triggerElm, tooltipElm, updatePosition);
		onCleanup(cleanup);
	});

	// Event listeners for triggering visibility
	const show = () => setVisible(true);
	const hide = () => setVisible(false);
	const hideOnMouseOut = (event: FocusEvent) => {
		// Ignore mouseout events that are still within the tooltip
		if (tooltip()?.contains(event.relatedTarget as Node)) return;
		hide();
	};

	const tooltipId = createMemo(() => rest.id || generateId('tooltip'));

	const triggerCtrlRef = (control: FormElementControl) => {
		control.addRef(setTrigger);
		control.handle('onMouseOver', show);
		control.handle('onMouseOut', hideOnMouseOut);
		control.handle('onFocusIn', show);
		control.handle('onFocusOut', hide);
		control.extAttr('aria-describedby', tooltipId);
	};

	return (
		<FormElementProvider ctrlRef={triggerCtrlRef}>
			{local.children}
			<TooltipContent {...rest} ref={combineRefs(setTooltip, rest.ref)}>
				{local.tip}
			</TooltipContent>
		</FormElementProvider>
	);
}
