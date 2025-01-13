import { type JSX } from 'solid-js';

/**
 * Util for calling a possibly bound event handler
 */
export function handleEvent<
	T,
	TEvent extends Event,
	THandler extends JSX.EventHandler<T, any> = JSX.EventHandler<T, TEvent>,
>(
	thisElm: HTMLElement | null,
	handler: JSX.EventHandlerUnion<T, TEvent, THandler> | undefined,
	event: TEvent,
	...rest: any[]
) {
	if (typeof handler === 'function') {
		handler.call(thisElm, event);
	} else if (handler) {
		handler[0].call(thisElm, handler[1], ...([event, ...rest] as Parameters<THandler>));
	}
}
