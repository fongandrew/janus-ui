/**
 * Utilities for associating a delegated event handler with a node via a data prop
 */
import {
	type CallbackRegistry,
	createCallbackRegistry,
} from '~/shared/utility/callback-attrs/callback-registry';
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import {
	isImmediatePropagationStopped,
	isPropagationStopped,
	wrapStopPropagation,
} from '~/shared/utility/event-propagation';

/** Data attribute used to identify delegated event handlers */
export const HANDLER_ATTR_PREFIX = 'data-t-on-';

/**
 * List of supported delegatable events. If map is true, then we delegate via useCapture
 */
const DELEGATABLE_EVENTS = {
	beforetoggle: true,
	beforeinput: false,
	change: false,
	close: true,
	contextmenu: false,
	copy: false,
	click: false,
	cut: false,
	dblclick: false,
	focusin: true,
	focusout: true,
	input: false,
	invalid: true,
	keydown: false,
	keypress: false,
	keyup: false,
	mousedown: false,
	mouseup: false,
	mousemove: false,
	mouseover: false,
	mouseout: false,
	paste: false,
	pointerdown: false,
	pointermove: false,
	pointerout: false,
	pointerover: false,
	pointerup: false,
	reset: false,
	submit: false,
	toggle: true,
	touchcancel: false,
	touchend: false,
	touchmove: false,
	touchstart: false,
};

/**
 * Interface mapping custom event types that support delegation to detail type
 */
export interface CustomEventDetails {
	// Nothing here yet but can add to this with:
	// `declare module "./event-handler-attrs" { interface CustomEventDetails { ... } }`
}

export type DelegatableEvent = keyof typeof DELEGATABLE_EVENTS | keyof CustomEventDetails;

export type DelegatableEventMap = {
	[T in DelegatableEvent]: T extends keyof HTMLElementEventMap
		? HTMLElementEventMap[T]
		: T extends keyof CustomEventDetails
			? Event & { detail: CustomEventDetails[T] }
			: Event;
};

/**
 * A map of all the registries for different event types. Presence of event
 * type also indicates we have an event listener attached to the document for this event,
 * so don't clean up key if all event types are removed (or make sure to remove the listener
 * too if we do).
 */
const handlerRegistries: Record<
	string,
	CallbackRegistry<(e: Event & { currentTarget: HTMLElement }) => void>
> = {};

/**
 * Shared event that does event delegation
 */
function eventHandler(event: Event) {
	const registry = handlerRegistries[event.type];
	if (!registry) return;

	wrapStopPropagation(event);
	for (const node of event.composedPath()) {
		if (isPropagationStopped(event)) return;

		// `getAttribute` not defined on document
		if (!(node as HTMLElement).getAttribute) continue;

		Object.defineProperty(event, 'currentTarget', {
			configurable: true,
			value: node as HTMLElement,
		});
		for (const handler of registry.iter(node as HTMLElement)) {
			if (isImmediatePropagationStopped(event)) return;
			handler(event as Event & { currentTarget: HTMLElement });
		}
	}
}
/**
 * Maybe attach event handler to document if none exists, returns current handler map
 */
function getRegistry<T extends DelegatableEvent>(
	eventType: T,
): CallbackRegistry<(e: Event & { currentTarget: HTMLElement }) => void> {
	let registry = handlerRegistries[eventType];
	if (registry) return registry;

	registerDocumentSetup((document) => {
		document.addEventListener(eventType, eventHandler, {
			capture: !!DELEGATABLE_EVENTS[eventType as keyof typeof DELEGATABLE_EVENTS],
		});
	});

	registry = createCallbackRegistry<(e: Event & { currentTarget: HTMLElement }) => void>(
		`${HANDLER_ATTR_PREFIX}${eventType}`,
	);
	handlerRegistries[eventType] = registry;
	return registry;
}

/**
 * Create a function that will lazily register the handler with registry and returns
 * the given ID.
 */
export function createHandler<
	TEventType extends DelegatableEvent,
	TExtra extends (string | undefined)[],
>(
	eventType: TEventType,
	handlerId: string,
	handler: (
		this: HTMLElement,
		event: DelegatableEventMap[TEventType] & { currentTarget: HTMLElement },
		...extraArgs: TExtra
	) => void,
) {
	return getRegistry(eventType).create<TExtra>(
		handlerId,
		handler as (e: Event, ...extra: TExtra) => void,
	);
}
