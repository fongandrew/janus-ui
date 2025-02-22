import { createEffect, createUniqueId, onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';

import { registerDocumentSetup } from '~/shared/utility/document-setup';
import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';

/** Prefix for magic attribute used to identify elements with attached event delegates */
export const EVENT_DELEGATE_ATTR_PREFIX = 'data-event-delegate';

/** Extra attributes added to a delegated event */
export interface EventDelegateProps<TProps> {
	/** Props from Solid */
	props: TProps;
	/** What the event delegate is actually attached to */
	delegateTarget: HTMLElement;
	/** Cast actual target to HTMLElement for ease of typing */
	target: HTMLElement;
}

/**
 * Event delegation utility meant to be used in conjunction with Solid. Solid does its own
 * event delegation but not for all events, so this is here for that. Returns a function
 * that registers an element with an event delegate and optionally takes some props.
 *
 * This should be called in module top-level / only called once.
 */
export function createEventDelegate<TEvent extends keyof DocumentEventMap, TProps = void>(
	eventType: TEvent,
	callback: (event: DocumentEventMap[TEvent] & EventDelegateProps<TProps>) => any,
	options?: boolean | AddEventListenerOptions,
) {
	if (isServer) return () => {};

	/** Unique ID used to identify element has handler for this callback */
	const eventId = createUniqueId();

	/** Magic attribute for identifying elements with event delegate attached */
	const eventDelegateAttr = `${EVENT_DELEGATE_ATTR_PREFIX}-${eventId}`;

	/** Map from element to passed props (from Solid) */
	const propsMap = new WeakMap<HTMLElement, TProps>();

	/** Event handler that gets added once */
	function handleEvent(event: DocumentEventMap[TEvent]) {
		const target = event.target as HTMLElement | null;
		if (!target) return;

		// Is this one of our delegated elements?
		const delegateTarget = target.closest(`[${eventDelegateAttr}]`) as HTMLElement;
		if (!delegateTarget) return;
		(event as typeof event & EventDelegateProps<TProps>).delegateTarget = delegateTarget;

		// Props for this control
		const props = propsMap.get(delegateTarget);
		if (props) {
			(event as typeof event & EventDelegateProps<TProps>).props = props;
		}

		// Assert props exist since the returned usage function below will require
		// props if TProps is not void
		callback(event as typeof event & EventDelegateProps<TProps>);
	}

	/**
	 * Register our handler on current and maybe other documents
	 */
	registerDocumentSetup((document) => {
		document.addEventListener(eventType, handleEvent, options);
	});

	return ((refAccessor: () => HTMLElement | null, props: TProps) => {
		const isMounted = createMountedSignal();
		createEffect(() => {
			// Wait until mounted since owner document on element will change
			if (!isMounted()) return;

			// Make sure we have an element
			const element = refAccessor();
			if (!element) return;

			// Store props for this element
			if (typeof props !== 'undefined') {
				propsMap.set(element, props);
				onCleanup(() => {
					propsMap.delete(element);
				});
			}

			// Attach the event delegate attribute
			element.setAttribute(eventDelegateAttr, 'true');
		});
	}) as TProps extends void
		? (refAccessor: () => HTMLElement | null) => void
		: (refAccessor: () => HTMLElement | null, props: TProps) => void;
}
