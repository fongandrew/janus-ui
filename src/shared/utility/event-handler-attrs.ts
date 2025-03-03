/**
 * Utilities for associating a delegated event handler with a node via a data prop
 */
import { registerDocumentSetup } from '~/shared/utility/document-setup';
import {
	isImmediatePropagationStopped,
	isPropagationStopped,
	wrapStopPropagation,
} from '~/shared/utility/event-propagation';
import { data } from '~/shared/utility/magic-strings';

/** Data attribute used to identify delegated event handlers */
export const HANDLER_ATTR = data('handler');

/**
 * Delegated handler registry mapping event types to IDs to event handlers. Presence of event
 * type also indicates we have an event listener attached to the document for this event,
 * so don't clean up key if all event types are removed (or make sure to remove the listener
 * too if we do).
 */
const handlerRegistry: Record<string, Record<string, (event: Event) => void>> = {};

/**
 * Shared event that does event delegation
 */
function eventHandler(event: Event) {
	const handlers = handlerRegistry[event.type];
	if (!handlers) return;

	wrapStopPropagation(event);
	for (const node of event.composedPath()) {
		if (isPropagationStopped(event)) return;

		// `getAttribute` not defined on document
		const attrValue = (node as HTMLElement).getAttribute?.(HANDLER_ATTR);
		if (!attrValue) continue;

		const eventWithDelegateTarget = Object.assign(event, {
			delegateTarget: node as HTMLElement,
		});
		for (const handlerId of attrValue.split(' ')) {
			if (isImmediatePropagationStopped(event)) return;
			handlers[handlerId]?.(eventWithDelegateTarget);
		}
	}
}

/**
 * List of supported delegatable events. If map is true, then we delegate via useCapture
 */
const DELEGATABLE_EVENTS = {
	beforetoggle: true,
	beforeinput: false,
	change: false,
	contextmenu: false,
	copy: false,
	click: false,
	cut: false,
	dblclick: false,
	focusin: true,
	focusout: true,
	input: false,
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
 * Maybe attach event handler to document if none exists, returns current handler map
 */
function getHandlerMap<T extends keyof typeof DELEGATABLE_EVENTS>(
	eventType: T,
): Record<string, (event: HTMLElementEventMap[T] & { delegateTarget: HTMLElement }) => void> {
	let handlerMap = handlerRegistry[eventType];
	if (handlerMap) return handlerMap;

	if (!(eventType in DELEGATABLE_EVENTS)) {
		throw new Error(`Unsupported event type: ${eventType}`);
	}

	registerDocumentSetup((document) => {
		document.addEventListener(eventType, eventHandler, {
			capture: DELEGATABLE_EVENTS[eventType],
		});
	});

	handlerMap = {};
	handlerRegistry[eventType] = handlerMap;
	return handlerMap;
}

/**
 * Register a delegated event handler with a given ID
 */
export function listen<T extends keyof typeof DELEGATABLE_EVENTS>(
	eventType: T,
	handlerId: string,
	handler: (event: HTMLElementEventMap[T] & { delegateTarget: HTMLElement }) => void,
) {
	getHandlerMap(eventType)[handlerId] = handler;
}

/**
 * Remove delegated event handler with given ID. Probably no reason to call this
 * but it's here if needed.
 */
export function unlisten<T extends keyof typeof DELEGATABLE_EVENTS>(
	eventType: T,
	handlerId: string,
) {
	return delete handlerRegistry[eventType]?.[handlerId];
}

/**
 * Create a function that will lazily register the handler with registry and returns
 * the given ID.
 */
export function createHandler<T extends keyof typeof DELEGATABLE_EVENTS>(
	eventType: T,
	handlerId: string,
	handler: (event: HTMLElementEventMap[T] & { delegateTarget: HTMLElement }) => void,
) {
	function handle() {
		listen(eventType, handlerId, (e) => handle.do(e));
		return handlerId;
	}

	// Stick original handler on the function so it can be easily composed with other handlers
	// or spied on for tests
	handle.do = handler;

	return handle;
}

/**
 * Convenience function to return a spreadable props object with the handler ID(s)
 */
export function handlerProps(
	...handlersOrProps: (Record<string, any> | string | (() => string))[]
): Record<string, string> {
	const ids: string[] = [];
	for (const idOrProps of handlersOrProps) {
		switch (typeof idOrProps) {
			case 'string':
				ids.push(idOrProps);
				break;
			case 'function':
				ids.push(idOrProps());
				break;
			case 'object':
				if (idOrProps[HANDLER_ATTR]) ids.push(idOrProps[HANDLER_ATTR] as string);
				break;
		}
	}
	return { [HANDLER_ATTR]: ids.join(' ') };
}

/**
 * Convenience function to use handler props with a prop mod
 */
export function extendHandlerProps(...handlerIds: (string | (() => string))[]) {
	return {
		[HANDLER_ATTR]: (prevIds: string | undefined) => {
			const ids = prevIds ? [prevIds] : [];
			for (const id of handlerIds) {
				if (typeof id === 'string') ids.push(id);
				else ids.push(id());
			}
			return ids.join(' ');
		},
	};
}
