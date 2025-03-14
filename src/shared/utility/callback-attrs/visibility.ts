/**
 * Callbacks for when a target element (such as a modal or popover) is hidden and shown.
 * These can be used to set up / tear down code or state as needed. This is not tied to
 * any normal browser event system and must be hooked into explicitly.
 */

import {
	type CallbackRegistry,
	createCallbackRegistry,
} from '~/shared/utility/callback-attrs/callback-registry';

/** Basic callback, called after show/hide */
export type VisibilityChangeCallback = (
	this: HTMLElement,
	element: HTMLElement,
	container: HTMLElement,
) => void;

/** Magic attribute to register a callback run before an element is hown */
export const BEFORE_SHOW_ATTR = 'data-t-visibility__before-show';

const beforeShowRegistry = createCallbackRegistry<VisibilityChangeCallback>(BEFORE_SHOW_ATTR);
export const createBeforeShowCallback = beforeShowRegistry.create;

/** Magic attribute to register a callback after an element is hidden */
export const HIDE_ATTR = 'data-t-visibility__hide';

const afterHideRegistry = createCallbackRegistry<VisibilityChangeCallback>(HIDE_ATTR);
export const createAfterHideCallback = afterHideRegistry.create;

/**
 * Run callbacks for a container after it's shown or hidden
 */
function runContainerCallbacks(
	registry: CallbackRegistry<VisibilityChangeCallback>,
	container: HTMLElement,
) {
	for (const callback of registry.iter(container)) {
		callback(container, container);
	}

	const elements = container.querySelectorAll<HTMLElement>(`[${registry.attr}]`);
	for (const element of elements) {
		const closestVisBoundary = element.closest<HTMLElement>(
			'[aria-hidden="true"],dialog:not(:modal),[popover]:not(:popover-open)',
		);
		if (!closestVisBoundary || closestVisBoundary.contains(element)) {
			for (const callback of registry.iter(element)) {
				callback(element, container);
			}
		}
	}
}

export const runBeforeShowCallbacks = (container: HTMLElement) =>
	runContainerCallbacks(beforeShowRegistry, container);
export const runAfterHideCallbacks = (container: HTMLElement) =>
	runContainerCallbacks(afterHideRegistry, container);
