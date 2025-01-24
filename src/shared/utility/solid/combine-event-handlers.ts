import { type JSX } from 'solid-js';

import { handleEvent } from '~/shared/utility/solid/handle-event';

/**
 * Delegated event handler that loops through multiple bound handlers and stops
 * if event.stopImmediatePropagation is called.
 */
function handleEvents<TTarget extends HTMLElement, TEvent extends Event>(
	this: TTarget | null,
	handlers: (JSX.EventHandlerUnion<TTarget, TEvent> | undefined | null | false | 0)[],
	event: TEvent,
) {
	const originalStopImmediatePropagation = event.stopImmediatePropagation;
	let stopImmediatePropagationCalled = false;

	event.stopImmediatePropagation = function () {
		stopImmediatePropagationCalled = true;
		originalStopImmediatePropagation.call(event);
	};

	for (const handler of handlers) {
		if (!stopImmediatePropagationCalled) {
			handleEvent(this, handler, event);
		}
	}
}

/**
 * Combines multiple Solid event handlers (including bound ones) in order passed. Can call
 * stopImmediatePropagation to prevent calling.
 */
export function combineEventHandlers<TTarget extends HTMLElement, TEvent extends Event>(
	...handlers: (JSX.EventHandlerUnion<TTarget, TEvent> | undefined | null | false | 0)[]
): JSX.BoundEventHandler<TTarget, TEvent> {
	return [handleEvents, handlers];
}

/**
 * Event handler that just calls whatever handler is set in props object. Meant to be bound
 * to a 2-tuple of props and key.
 */
function handleProp<TTarget extends HTMLElement, TEvent extends Event, TKey extends string>(
	this: TTarget | null,
	data: [Partial<Record<TKey, JSX.EventHandlerUnion<TTarget, TEvent> | undefined>>, TKey],
	event: TEvent,
) {
	const [props, key] = data;
	const handler = props[key];
	if (handler) {
		handleEvent(this, handler, event);
	}
}

/**
 * Sometimes we want to combine multiple event handlers but directly accessing
 * a handler like props.onClick is potentially unsafe if done outside a reactive
 * context. So, let's just bind the entire prop object and an accessor funciton
 * and pass that to a callback combiner.
 */
export function bindProp<TProps, TKey extends keyof TProps>(
	props: TProps,
	propName: TKey,
): TProps[TKey] extends JSX.EventHandlerUnion<infer TTarget, infer TEvent> | undefined
	? JSX.BoundEventHandler<TTarget, TEvent>
	: unknown {
	return [handleProp, [props, propName]] as any;
}
