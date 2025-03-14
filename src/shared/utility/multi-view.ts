import { isServer } from 'solid-js/web';

// Export references to root window and doc in base we need it
export const parentWindow = isServer ? undefined : window;
export const parentDocument = isServer ? undefined : window.document;

/**
 * Util for getting document from a node. Useful to support multiple documents
 */
export function elmDoc(node: HTMLElement): Document;
export function elmDoc(node: HTMLElement | null | undefined): Document | undefined;
export function elmDoc(node: HTMLElement | null | undefined): Document | undefined {
	return node?.ownerDocument;
}

/**
 * Util for getting window from a node. Useful to support multiple windows. Window
 * is usually present but technically may be undefined.
 */
export function elmWin(node: HTMLElement): Window | null;
export function elmWin(node: HTMLElement | null | undefined): Window | null | undefined;
export function elmWin(node: HTMLElement | null | undefined): Window | null | undefined {
	return elmDoc(node)?.defaultView;
}

/**
 * Get document from event target.
 */
export function evtDoc(evt: Event): Document | undefined {
	return elmDoc(evt?.target as HTMLElement | undefined | null);
}

/**
 * Get window from event target. Technically, events may not have a target
 * or the target may not have a ownerDocument, but this doesn't happen if
 * used in an event handler so we're going to just force return type as Window.
 */
export function evtWin(evt: Event): Window | null | undefined {
	return elmWin(evt?.target as HTMLElement | undefined | null);
}
