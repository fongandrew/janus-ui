import { parentDocument } from '~/lib2/dom/multi-view';

export type DocumentCallbackFunction = (document: Document) => void;

/** Setup functions, tracked so we don't run twice and can re-run on new documents. */
const setupFunctions = new Set<DocumentCallbackFunction>();

/** Which documents are currently tracked -- so a new setup function can run on all of them. */
export const activeDocuments = new Set<Document>(parentDocument ? [parentDocument] : []);

/**
 * Run a setup function against every currently tracked document, and every
 * document registered later (a child/popup window via `registerDocument`).
 * This is how the dispatcher installs its single document-level listener
 * per event type without hardcoding the bare `document` global.
 */
export function registerDocumentSetup(setup: DocumentCallbackFunction): void {
	if (!setupFunctions.has(setup)) {
		setupFunctions.add(setup);
		for (const document of activeDocuments) {
			setup(document);
		}
	}
}

/** Track a new document (e.g. a popup window's) and run every registered setup function on it. */
export function registerDocument(document: Document): void {
	if (!activeDocuments.has(document)) {
		activeDocuments.add(document);
		document.defaultView?.addEventListener('beforeunload', () => {
			activeDocuments.delete(document);
		});
		for (const setup of setupFunctions) {
			setup(document);
		}
	}
}

/** Run a function against every currently tracked document. */
export function evalWithDocument(cb: DocumentCallbackFunction): void {
	for (const document of activeDocuments) {
		cb(document);
	}
}
