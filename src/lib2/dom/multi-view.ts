// Export references to root window and doc in case we need it. This is the
// one file allowed to reference the bare `window`/`document` globals
// (see eslint.config.js's `no-restricted-globals` exemption) -- everything
// else should go through `document-setup.ts` or derive a document from an
// element/event so multi-window consumers (a child/popup window) work.

export const parentWindow = typeof window === 'undefined' ? undefined : window;
export const parentDocument = typeof window === 'undefined' ? undefined : window.document;

/** Get the document a node belongs to. Useful to support multiple documents. */
export function elmDoc(node: Node): Document;
export function elmDoc(node: Node | null | undefined): Document | undefined;
export function elmDoc(node: Node | null | undefined): Document | undefined {
	return node?.ownerDocument ?? (node as Document | undefined)?.defaultView?.document;
}

/** Get the window a node belongs to. Useful to support multiple windows. */
export function elmWin(node: Node): Window | null;
export function elmWin(node: Node | null | undefined): Window | null | undefined;
export function elmWin(node: Node | null | undefined): Window | null | undefined {
	return elmDoc(node)?.defaultView;
}

/** Get the document an event's target belongs to. */
export function evtDoc(evt: Event): Document | undefined {
	return elmDoc(evt.target as Node | undefined | null);
}

/** Get the window an event's target belongs to. */
export function evtWin(evt: Event): Window | null | undefined {
	return elmWin(evt.target as Node | undefined | null);
}
