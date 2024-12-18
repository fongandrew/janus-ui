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

export const TOOLTIP_TRIGGER_ATTR = 'data-tooltip-trigger';
export const TOOLTIP_ARROW_ATTR = 'data-tooltip-arrow';

/** Track which documents have our delegated handler on them */
const didAttachToDocument = new WeakSet<Document>();

/** Map from trigger to signal setter for delegated handler */
const triggerMap = new Map<HTMLElement, (over: boolean) => void>();

/** Track active trigger for this document for ease of clearing stuck tooltips */
const activeTriggerMap = new WeakMap<Document, HTMLElement>();

function handleTooltipEvent(event: MouseEvent | FocusEvent) {
	const target = event.target as HTMLElement;
	if (!target) return;

	const activeTrigger = activeTriggerMap.get(target.ownerDocument);
	const triggerElement = target.closest(`[${TOOLTIP_TRIGGER_ATTR}]`) as HTMLElement | null;

	if (event.type === 'mouseover' || event.type === 'focus') {
		if (activeTrigger !== triggerElement) {
			if (activeTrigger) {
				triggerMap.get(activeTrigger)?.(false);
				activeTriggerMap.delete(target.ownerDocument);
			}
			if (triggerElement) {
				triggerMap.get(triggerElement)?.(true);
				activeTriggerMap.set(target.ownerDocument, triggerElement);
			}
		}
	} else if (
		(event.type === 'mouseout' || event.type === 'blur') &&
		// Don't hide tooltip if just moving from subelements within tooltip
		(event.relatedTarget as HTMLElement | null)?.closest(`[${TOOLTIP_TRIGGER_ATTR}]`) !==
			triggerElement
	) {
		if (triggerElement) {
			triggerMap.get(triggerElement)?.(false);
			activeTriggerMap.delete(target.ownerDocument);
		}
	}
}

function attachToDocument(targetDocument = window.document) {
	if (didAttachToDocument.has(targetDocument)) {
		return;
	}

	targetDocument.addEventListener('mouseover', handleTooltipEvent);
	targetDocument.addEventListener('mouseout', handleTooltipEvent);

	// Need capture phase for focus/blur events since they don't bubble
	targetDocument.addEventListener('focus', handleTooltipEvent, true);
	targetDocument.addEventListener('blur', handleTooltipEvent, true);

	didAttachToDocument.add(targetDocument);
}

// Used below to position arrow
const sideToStaticSide: Record<Side, Side> = {
	top: 'bottom',
	bottom: 'top',
	left: 'right',
	right: 'left',
};

export function createTooltip(defaultPlacement: Placement = 'top') {
	const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null);
	const [tooltipElement, setTooltipElement] = createSignal<HTMLElement | null>(null);
	const [visible, setVisible] = createSignal(false);

	// Callback for updating position
	const updatePosition = async (triggerElm: HTMLElement, tooltipElm: HTMLElement) => {
		const middleware: Middleware[] = [offset(8), flip(), shift({ padding: 8 })];
		const arrowElm = tooltipElm.querySelector(`[${TOOLTIP_ARROW_ATTR}]`) as HTMLElement | null;
		if (arrowElm) {
			middleware.push(arrow({ element: arrowElm }));
		}

		const { x, y, placement, middlewareData } = await computePosition(triggerElm, tooltipElm, {
			placement: defaultPlacement,
			middleware,
			strategy: 'fixed',
		});
		Object.assign(tooltipElm.style, {
			display: 'block',
			position: 'fixed',
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

	// Update display and positioning on visibility change
	createEffect(() => {
		const triggerElm = triggerElement();
		if (!triggerElm) return;

		const tooltipElm = tooltipElement();
		if (!tooltipElm) return;

		// Hide tooltip when not visible
		if (!visible()) {
			tooltipElm.style.display = 'none';
			return;
		}

		// Tooltip is visible. Do initial position update
		updatePosition(triggerElm, tooltipElm);

		// Auto update while scrolling while visible
		if (visible()) {
			const cleanup = autoUpdate(triggerElm, tooltipElm, () =>
				updatePosition(triggerElm, tooltipElm),
			);
			onCleanup(cleanup);
		}
	});

	// Assign ARIA attributes when both elements referenced
	createEffect(() => {
		const triggerElm = triggerElement();
		if (!triggerElm) return;

		const tooltipElm = tooltipElement();
		if (!tooltipElm) return;

		tooltipElm.role ??= 'tooltip';

		let id = tooltipElm.id;
		if (!id) {
			id = generateId('tooltip');
			tooltipElm.id = id;
		}
		triggerElm.setAttribute('aria-describedby', id);
	});

	const setTriggerElementAndInit = (el: HTMLElement) => {
		el.setAttribute(TOOLTIP_TRIGGER_ATTR, '');
		setTriggerElement(el);
		triggerMap.set(el, setVisible);
		attachToDocument();

		onCleanup(() => {
			triggerMap.delete(el);
		});
	};

	const setTooltipElementAndInit = (el: HTMLElement) => {
		el.style.display = 'none'; // Hide by default
		setTooltipElement(el);
	};

	return [setTriggerElementAndInit, setTooltipElementAndInit] as const;
}
