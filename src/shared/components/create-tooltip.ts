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
import { createEffect, createSignal, onCleanup } from 'solid-js';

import { generateId } from '~/shared/utility/id-generator';
import { createEventDelegate } from '~/shared/utility/solid/create-event-delegate';

export const TOOLTIP_ARROW_ATTR = 'data-tooltip-arrow';

// Used below to position arrow
const sideToStaticSide: Record<Side, Side> = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left',
};

// Use mouseover instead of mouseenter since it this is a delegated event handler that lives
// on the document. We prefer one event that bubbles instead of multiple events for each
// containing element (which might be a bit much in deeply nested trees).
const useMouseOver = createEventDelegate<'mouseover', { setVisible: (open: boolean) => void }>(
	'mouseover',
	(event) => {
		event.props.setVisible(true);
	},
);

// Prefer mouseout over mouseleave for the same reason as mouseover.
const useMouseOut = createEventDelegate<'mouseout', { setVisible: (open: boolean) => void }>(
	'mouseout',
	(event) => {
		// Ignore mouseout events that are still within the tooltip
		if (event.delegateTarget.contains(event.relatedTarget as Node)) return;
		event.props.setVisible(false);
	},
);

const useFocus = createEventDelegate<'focus', { setVisible: (open: boolean) => void }>(
	'focus',
	(event) => {
		event.props.setVisible(true);
	},
	true /* capture mode */,
);

const useBlur = createEventDelegate<'blur', { setVisible: (open: boolean) => void }>(
	'blur',
	(event) => {
		event.props.setVisible(false);
	},
	true /* capture mode */,
);

export function createTooltip(props: { placement?: Placement | undefined } = {}) {
	const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null);
	const [tooltipElement, setTooltipElement] = createSignal<HTMLElement | null>(null);
	const [visible, setVisible] = createSignal(false);

	// Callback for updating position
	const updatePosition = async (triggerElm: HTMLElement, tooltipElm: HTMLElement) => {
		const middleware: Middleware[] = [offset(8)];
		const arrowElm = tooltipElm.querySelector(`[${TOOLTIP_ARROW_ATTR}]`) as HTMLElement | null;
		if (arrowElm) {
			middleware.push(arrow({ element: arrowElm }));
		}
		middleware.push(flip(), shift({ padding: 8 }));

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

	// Update positioning on visibility change
	createEffect(() => {
		const triggerElm = triggerElement();
		if (!triggerElm) return;

		const tooltipElm = tooltipElement();
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

		//  Do initial position update, then update automatically when
		// scroll or resize events occur.
		tooltipElm.showPopover();
		updatePosition(triggerElm, tooltipElm);
		const cleanup = autoUpdate(triggerElm, tooltipElm, () =>
			updatePosition(triggerElm, tooltipElm),
		);
		onCleanup(cleanup);
	});

	// Assign ARIA attributes when both elements referenced
	createEffect(() => {
		const triggerElm = triggerElement();
		if (!triggerElm) return;

		const tooltipElm = tooltipElement();
		if (!tooltipElm) return;

		tooltipElm.role ??= 'tooltip';
		tooltipElm.popover = 'manual';

		let id = tooltipElm.id;
		if (!id) {
			id = generateId('tooltip');
			tooltipElm.id = id;
		}
		triggerElm.setAttribute('aria-describedby', id);
	});

	useMouseOver(triggerElement, { setVisible });
	useMouseOut(triggerElement, { setVisible });
	useFocus(triggerElement, { setVisible });
	useBlur(triggerElement, { setVisible });

	const setTooltipElementAndInit = (el: HTMLElement) => {
		el.popover = 'manual';
		setTooltipElement(el);
	};

	return [setTriggerElement, setTooltipElementAndInit] as const;
}
