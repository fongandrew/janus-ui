import { describe, expect, it } from 'vitest';

import { isKeyboardNavigatingActive, KB_NAV_ATTR } from '~/shared/utility/use-data-kb-nav';

describe('use-data-kb-nav', () => {
	it('should initialize keyboard navigation as inactive', () => {
		expect(isKeyboardNavigatingActive()).toBe(false);
	});

	it('should set keyboard navigation active on keydown event', () => {
		document.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
			}),
		);

		expect(isKeyboardNavigatingActive()).toBe(true);
		expect(document.body.getAttribute(KB_NAV_ATTR)).toBe('false');
	});

	it('should set keyboard navigation inactive on mousemove', () => {
		// First activate keyboard navigation
		document.dispatchEvent(
			new KeyboardEvent('keydown', {
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(isKeyboardNavigatingActive()).toBe(true);

		// Then trigger mouse move
		document.dispatchEvent(
			new MouseEvent('mousemove', {
				bubbles: true,
				cancelable: true,
			}),
		);
		expect(isKeyboardNavigatingActive()).toBe(false);
		expect(document.body.getAttribute(KB_NAV_ATTR)).toBe('false');
	});
});
