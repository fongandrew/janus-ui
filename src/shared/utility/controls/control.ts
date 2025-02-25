import { registerDocumentSetup } from '~/shared/utility/document-setup';
import {
	isImmediatePropagationStopped,
	isPropagationStopped,
	wrapStopPropagation,
} from '~/shared/utility/event-propagation';
import { prop } from '~/shared/utility/magic-strings';

/** Prop name for access to control associated with element */
const ELEMENT_CONTROL_REF = prop('control');

/** Assign control to node */
export function setControl<TElement extends HTMLElement>(
	node: TElement,
	control: Control<TElement, any>,
) {
	(node as any)[ELEMENT_CONTROL_REF] = control;
}

/** Get control back from node */
export function getControl<TControl extends Control<TElement, any>, TElement extends HTMLElement>(
	node: TElement,
): TControl | undefined {
	return (node as any)[ELEMENT_CONTROL_REF];
}

/**
 * Handler for event delegation
 */
function eventHandler(event: Event) {
	wrapStopPropagation(event);

	for (const node of event.composedPath()) {
		if (isPropagationStopped(event)) return;

		const control = getControl(node as HTMLElement);
		if ((control?.node as HTMLInputElement | undefined)?.disabled) return;

		control?.handle(event);
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

/** Prop name for set on document with all attached handlers */
const ATTACHED_HANDLERS = prop('attached');

/**
 * Maybe attach event handler
 */
function maybeAttachHandler(document: Document, eventType: keyof typeof DELEGATABLE_EVENTS) {
	if (!(eventType in DELEGATABLE_EVENTS)) {
		throw new Error(`Unsupported event type: ${eventType}`);
	}
	const attached = ((document as any)[ATTACHED_HANDLERS] ??= new Set());
	if (attached.has(eventType)) return;
	document.addEventListener(eventType, eventHandler, { capture: DELEGATABLE_EVENTS[eventType] });
	attached.add(eventType);
}

/**
 * A Control implements UI behavior for a component that be mounted, updated, and unmounted.
 * It is not responsible for rendering the initial DOM elements but is used to attach
 * event listeners, manage state, and cleanup resources (e.g. as a script to progressively
 * enhance static HTML).
 *
 * This class is meant to be extended and overridden. Not abstarct because we don't want
 * to force children to implement all methods.
 */
export class Control<TElement extends HTMLElement = HTMLElement, TProps = {}> {
	/**
	 * Map control props (should be TProps but static methods can't reference generics)
	 * to render props (e.g. for Solid).
	 */
	static mapProps<T extends Record<string, any>>(_props: T) {
		return {};
	}

	constructor(
		public node: TElement,
		public props: TProps,
	) {
		setControl(node, this);
		this.onMount();
	}

	/**
	 * Add behaviors and modify attributes after mount
	 */
	protected onMount() {}

	/**
	 * Update behaviors and attributes after update
	 */
	update(next: TProps) {
		this.props = next;
		this.onUpdate();
	}

	/**
	 * Callback to override when prop changes
	 */
	protected onUpdate() {}

	/**
	 * Remove behaviors and attributes before unmount
	 */
	cleanUp() {
		this.onCleanUp();
	}

	/**
	 * Callback to override when node is removed
	 */
	protected onCleanUp() {}

	/** Delegated event handlers */
	protected listeners: Record<
		string,
		Set<(this: Control<TElement, TProps>, event: any) => void>
	> = {};

	/**
	 * Add delegated event listener for a given event type
	 */
	listen<T extends keyof typeof DELEGATABLE_EVENTS>(
		eventType: T,
		callback: (this: Control<TElement, TProps>, event: HTMLElementEventMap[T]) => void,
	) {
		maybeAttachHandler(this.node.ownerDocument, eventType);
		const set = (this.listeners[eventType] ??= new Set());
		set.add(callback);
	}

	/**
	 * Remove listener
	 */
	unlisten<T extends keyof typeof DELEGATABLE_EVENTS>(
		eventType: T,
		callback?: (this: Control<TElement, TProps>, event: HTMLElementEventMap[T]) => void,
	) {
		if (callback) {
			this.listeners[eventType]?.delete(callback);
		} else {
			delete this.listeners[eventType];
		}
	}

	/**
	 * Handle delegated event
	 */
	handle(event: Event) {
		for (const callback of this.listeners[event.type] ?? []) {
			if (isImmediatePropagationStopped(event)) return;
			callback.call(this, event);
		}
	}

	/**
	 * Convenience helper for access to document specific to this node
	 */
	document() {
		return this.node.ownerDocument;
	}

	/**
	 * Convenience helper for access to window specific to this node
	 */
	window() {
		return this.document().defaultView;
	}
}

/** Init all controls with a given data attribute */
export function initControls<TDataAttr extends string, TElement extends HTMLElement, TProps>(
	dataAttr: TDataAttr,
	ControlCls: typeof Control<TElement, TProps>,
	props: TProps,
) {
	registerDocumentSetup((document) => {
		for (const node of document.querySelectorAll(`[${dataAttr}]`)) {
			new ControlCls(node as TElement, props);
		}
	});
}
