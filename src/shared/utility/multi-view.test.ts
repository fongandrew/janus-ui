import { describe, expect, it } from 'vitest';

import { elmDoc, elmWin, evtDoc, evtWin } from '~/shared/utility/multi-view';

describe('multi-view utilities', () => {
	// Mock elements and events
	const mockDocument = document;
	const mockWindow = window;
	const mockNode = document.createElement('div');
	const mockEvent = new Event('click', { bubbles: true });

	beforeAll(() => {
		document.body.appendChild(mockNode);
		mockNode.dispatchEvent(mockEvent);
	});

	afterAll(() => {
		document.body.removeChild(mockNode);
	});

	it('elmDoc should return the document of a node', () => {
		expect(elmDoc(mockNode)).toBe(mockDocument);
		expect(elmDoc(null)).toBeUndefined();
		expect(elmDoc(undefined)).toBeUndefined();
	});

	it('elmWin should return the window of a node', () => {
		expect(elmWin(mockNode)).toBe(mockWindow);
		expect(elmWin(null)).toBeUndefined();
		expect(elmWin(undefined)).toBeUndefined();
	});

	it('evtDoc should return the document of an event target', () => {
		expect(evtDoc(mockEvent)).toBe(mockDocument);
	});

	it('evtWin should return the window of an event target', () => {
		expect(evtWin(mockEvent)).toBe(mockWindow);
	});
});
