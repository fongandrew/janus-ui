import {
	activeDocuments,
	registerDocument,
	registerDocumentSetup,
} from '~/shared/utility/document-setup';
import { parentDocument } from '~/shared/utility/multi-view';

describe('document-setup', () => {
	afterEach(() => {
		// Clean up any registered documents that aren't the parent
		for (const doc of activeDocuments) {
			if (doc !== parentDocument) {
				activeDocuments.delete(doc);
			}
		}
	});

	it('should automatically track the parent document', () => {
		expect(activeDocuments.size).toBe(1);
		expect(activeDocuments.has(parentDocument!)).toBe(true);
	});

	it('should run setup functions on parent document', () => {
		const mockSetup = vi.fn();

		registerDocumentSetup(mockSetup);

		expect(mockSetup).toHaveBeenCalledTimes(1);
		expect(mockSetup).toHaveBeenCalledWith(parentDocument);
	});

	it('should register and run setup functions on a new document', () => {
		const mockSetup = vi.fn();

		// Register the setup function first
		registerDocumentSetup(mockSetup);

		// Initial setup ran on parent document only
		expect(mockSetup).toHaveBeenCalledTimes(1);
		expect(mockSetup).toHaveBeenCalledWith(parentDocument);

		// Create a new document and register it
		const newDocument = document.implementation.createHTMLDocument('Test Document');
		registerDocument(newDocument);

		// Should run setup on the new document and add it to active documents
		expect(activeDocuments.size).toBe(2);
		expect(activeDocuments.has(newDocument)).toBe(true);
		expect(mockSetup).toHaveBeenCalledTimes(2);
		expect(mockSetup).toHaveBeenCalledWith(newDocument);
	});

	it('should add new setup functions to all active documents', () => {
		// Create a new document and register it
		const newDocument = document.implementation.createHTMLDocument('Test Document');
		registerDocument(newDocument);
		expect(activeDocuments.size).toBe(2);

		// Now add a setup function
		const mockSetup = vi.fn();
		registerDocumentSetup(mockSetup);

		// Should run on both documents
		expect(mockSetup).toHaveBeenCalledTimes(2);
		expect(mockSetup).toHaveBeenCalledWith(parentDocument);
		expect(mockSetup).toHaveBeenCalledWith(newDocument);
	});

	it('should only register setup functions once', () => {
		const mockSetup = vi.fn();

		// Register the same setup function twice
		registerDocumentSetup(mockSetup);
		registerDocumentSetup(mockSetup);

		// Should only be called once for parent document
		expect(mockSetup).toHaveBeenCalledTimes(1);
	});

	it('should remove document from active documents on beforeunload', () => {
		// Create a new document and register it
		const newDocument = document.implementation.createHTMLDocument('Test Document');

		const listeners: Record<string, EventListener[]> = {};
		Object.defineProperty(newDocument, 'defaultView', {
			value: {
				addEventListener: (type: string, listener: EventListener) => {
					(listeners[type] ??= []).push(listener);
				},
				dispatchEvent: (event: Event) => {
					for (const listener of listeners[event.type] ?? []) {
						listener(event);
					}
				},
			},
		});

		registerDocument(newDocument);
		expect(activeDocuments.size).toBe(2);
		expect(activeDocuments.has(newDocument)).toBe(true);

		// Dispatch the beforeunload event
		const event = new Event('beforeunload');
		newDocument.defaultView?.dispatchEvent(event);

		// Document should be removed from active documents
		expect(activeDocuments.size).toBe(1);
		expect(activeDocuments.has(newDocument)).toBe(false);
	});
});
