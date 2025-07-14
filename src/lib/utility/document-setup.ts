import { parentDocument } from '~/lib/utility/multi-view';

export type DocumentSetupFunction = (document: Document) => void;

/**
 * Track all the setup functions (so we don't run twice and can re-run on all new
 * open documents).
 */
const setupFunctions = new Set<DocumentSetupFunction>();

/**
 * Track which documents are open (so when adding a new setup function, we can call the
 * function on all open documents).
 */
export const activeDocuments = new Set<Document>(parentDocument ? [parentDocument] : []);

/**
 * A thin wrapper for a setup function to run whenever a document is ready. By default, runs
 * on the current document after idle period. Will also be triggered for new documents (if
 * doing child windows or something like that).
 */
export const registerDocumentSetup = (setup: DocumentSetupFunction) => {
	if (!setupFunctions.has(setup)) {
		setupFunctions.add(setup);
		for (const document of activeDocuments) {
			setup(document);
		}
	}
};

/**
 * Register a document to be tracked and have setup functions run on it.
 */
export function registerDocument(document: Document) {
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
