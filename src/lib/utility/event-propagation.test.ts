import { describe, expect, it } from 'vitest';

import {
	isImmediatePropagationStopped,
	isPropagationStopped,
	wrapStopPropagation,
} from '~/lib/utility/event-propagation';
import { mount } from '~/lib/utility/test-utils/mount';

describe('event-propagation', () => {
	it('should properly wrap stopPropagation', () => {
		const mockEvent = new Event('click');

		// Initially, propagation should not be stopped
		expect(isPropagationStopped(mockEvent)).toBeUndefined();

		// Wrap the event methods
		wrapStopPropagation(mockEvent);

		// Before calling stopPropagation, both flags should be false/undefined
		expect(isPropagationStopped(mockEvent)).toBeUndefined();
		expect(isImmediatePropagationStopped(mockEvent)).toBeUndefined();

		// Call stopPropagation
		mockEvent.stopPropagation();

		// After calling stopPropagation, only isPropagationStopped should be true
		expect(isPropagationStopped(mockEvent)).toBe(true);
		expect(isImmediatePropagationStopped(mockEvent)).toBeUndefined();
	});

	it('should properly wrap stopImmediatePropagation', () => {
		const mockEvent = new Event('click');

		// Wrap the event methods
		wrapStopPropagation(mockEvent);

		// Before calling stopImmediatePropagation, both flags should be false/undefined
		expect(isPropagationStopped(mockEvent)).toBeUndefined();
		expect(isImmediatePropagationStopped(mockEvent)).toBeUndefined();

		// Call stopImmediatePropagation
		mockEvent.stopImmediatePropagation();

		// After calling stopImmediatePropagation, both flags should be true
		expect(isPropagationStopped(mockEvent)).toBe(true);
		expect(isImmediatePropagationStopped(mockEvent)).toBe(true);
	});

	it('should stop propagation when stopPropagation is called on the DOM', () => {
		const mockEvent = new Event('click', { bubbles: true });
		const div = document.createElement('div');
		const childDiv = document.createElement('div');
		div.appendChild(childDiv);

		mount(div);

		let parentHandlerCalled = false;
		div.addEventListener('click', () => {
			parentHandlerCalled = true;
		});

		childDiv.addEventListener('click', (event) => {
			wrapStopPropagation(event);
			event.stopPropagation();
		});

		childDiv.dispatchEvent(mockEvent);

		expect(parentHandlerCalled).toBe(false);
		expect(isPropagationStopped(mockEvent)).toBe(true);
	});

	it('should stop immediate propagation when stopImmediatePropagation is called on the DOM', () => {
		const mockEvent = new Event('click', { bubbles: true });
		const div = document.createElement('div');
		mount(div);

		let firstHandlerCalled = false;
		let secondHandlerCalled = false;

		div.addEventListener('click', (event) => {
			wrapStopPropagation(event);
			event.stopImmediatePropagation();
			firstHandlerCalled = true;
		});

		div.addEventListener('click', () => {
			secondHandlerCalled = true;
		});

		div.dispatchEvent(mockEvent);

		expect(firstHandlerCalled).toBe(true);
		expect(secondHandlerCalled).toBe(false);
		expect(isImmediatePropagationStopped(mockEvent)).toBe(true);
	});
});
