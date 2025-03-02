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

import { createHandler } from '~/shared/utility/event-handler-attrs';
import { createMagicProp } from '~/shared/utility/magic-prop';
import { data } from '~/shared/utility/magic-strings';
import { elmDoc } from '~/shared/utility/multi-view';
import { onUnmount } from '~/shared/utility/unmount-observer';

// Used below to position arrow
const sideToStaticSide: Record<Side, Side> = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left',
};

const [cleanUpCallback, setCleanUpCallback] = createMagicProp<() => void>();

/** Set tooltip cleanup function */
export const setTooltipCleanUp = (tooltip: HTMLElement, cleanUp: () => void) => {
	setCleanUpCallback(tooltip, cleanUp);
	onUnmount(tooltip, cleanUpTooltip);
};

/** Clean up observers associated with a tooltip */
export const cleanUpTooltip = (tooltip: HTMLElement) => {
	const cleanUp = cleanUpCallback(tooltip);
	cleanUp?.();
	setCleanUpCallback(tooltip, undefined);
};

const [tooltipCleanup, setTooltipCleanup] = createMagicProp<() => void>();

/** Show tooltip when mousing over */
export const tooltipMouseOver = Object.assign(
	createHandler('mouseover', 'tooltip__mouseover', (event) => {
		const trigger = event.target as HTMLElement;
		const tooltip = tooltipFromTrigger(trigger);
		if (!tooltip) return;
		showTooltip(trigger, tooltip);
	}),
	{
		ARROW_ATTR: data('tooltip-arrow'),
		PLACEMENT_ATTR: data('tooltip-placement'),
	},
);

/** Hide tooltip when mousing out */
export const tooltipMouseOut = createHandler('mouseout', 'tooltip__mouseout', (event) => {
	const tooltip = tooltipFromTrigger(event.target as HTMLElement);
	if (!tooltip) return;

	// Ignore mouseout events that are still within the tooltip
	if (tooltip.contains(event.relatedTarget as Node)) return;

	hideTooltip(tooltip);
});

/** Show tooltip on focus */
export const tooltipFocus = createHandler('focusin', 'tooltip__focus', (event) => {
	const trigger = event.target as HTMLElement;
	const tooltip = tooltipFromTrigger(trigger);
	if (!tooltip) return;
	showTooltip(trigger, tooltip);
});

/** Hide tooltip on blur */
export const tooltipBlur = createHandler('focusout', 'tooltip__blur', (event) => {
	const tooltip = tooltipFromTrigger(event.target as HTMLElement);
	if (!tooltip) return;
	hideTooltip(tooltip);
});

function showTooltip(trigger: HTMLElement, tooltip: HTMLElement) {
	// Only one tooltip can be shown at a time
	const document = elmDoc(tooltip);
	for (const otherTooltips of document.querySelectorAll<HTMLElement>(
		'[role="tooltip"]:popover-open',
	)) {
		otherTooltips.hidePopover();
	}

	// Show the intended tooltip
	tooltip.showPopover();

	// Position it
	updatePosition(trigger, tooltip);

	const cleanUp = autoUpdate(trigger, tooltip, () => updatePosition(trigger, tooltip));
	setTooltipCleanUp(tooltip, cleanUp);
}

function hideTooltip(tooltip: HTMLElement) {
	tooltip.hidePopover();
	cleanUpTooltip(tooltip);
}

/**
 * Gets tooltip describing the trigger. We assume there is an `aria-describedby` relationship,
 * the tooltip has `role="tooltip"`, and there is at most one tooltip.
 */
function tooltipFromTrigger(trigger: HTMLElement) {
	const document = elmDoc(trigger);

	const describedBy = trigger.getAttribute('aria-describedby') ?? '';
	for (const id of describedBy.split(/\s+/)) {
		const tooltip = document.getElementById(id);
		if (tooltip?.role === 'tooltip') {
			return tooltip;
		}
	}

	return null;
}

/**
 * Position tooltip relative to trigger
 */
const updatePosition = async (trigger: HTMLElement, tooltip: HTMLElement) => {
	if (!trigger.isConnected || !tooltip.isConnected) {
		const cleanUp = tooltipCleanup(tooltip);
		cleanUp?.();
		setTooltipCleanup(tooltip, undefined);
		return;
	}

	const middleware: Middleware[] = [offset(8), flip()];
	const arrowElm = tooltip.querySelector(
		`[${tooltipMouseOver.ARROW_ATTR}]`,
	) as HTMLElement | null;
	if (arrowElm) {
		middleware.push(arrow({ element: arrowElm }));
	}
	middleware.push(shift({ padding: 8 }));

	const { x, y, placement, middlewareData } = await computePosition(trigger, tooltip, {
		placement:
			(trigger.getAttribute(tooltipMouseOver.PLACEMENT_ATTR) as Placement | null) ?? 'top',
		middleware,
		strategy: 'fixed',
	});

	Object.assign(tooltip.style, {
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
			[staticSide]: 'calc(var(--v-tooltip-arrow-size) / -2)',
		});
	}
};
