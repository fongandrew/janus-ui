import { getScrollableParent } from '~/shared/utility/get-scrollable-parent';
import { mount } from '~/shared/utility/test-utils/mount';

describe('getScrollableParent', () => {
	it('should return null when element is null', () => {
		const result = getScrollableParent(null);
		expect(result).toBeNull();
	});

	it('should return null when document or window is not available', () => {
		// Simulate a scenario where the element is detached from the DOM
		const element = document.createElement('div');
		Object.defineProperty(element, 'ownerDocument', { value: null });

		const result = getScrollableParent(element);

		expect(result).toBeNull();
	});

	it('should return document.documentElement when element is document.documentElement', () => {
		const result = getScrollableParent(document.documentElement);
		expect(result).toBe(document.documentElement);
	});

	it('should return the element itself when it has overflow: auto', () => {
		const element = document.createElement('div');
		element.style.overflow = 'auto';
		document.body.appendChild(element);

		const result = getScrollableParent(element);

		expect(result).toBe(element);

		document.body.removeChild(element);
	});

	it('should return the element itself when it has overflowY: scroll', () => {
		const element = document.createElement('div');
		element.style.overflowY = 'scroll';
		mount(element);

		const result = getScrollableParent(element);
		expect(result).toBe(element);
	});

	it('should return the parent element when parent has overflow: auto', () => {
		const parentElement = document.createElement('div');
		parentElement.style.overflow = 'auto';
		const childElement = document.createElement('div');
		parentElement.appendChild(childElement);
		mount(parentElement);

		const result = getScrollableParent(childElement);
		expect(result).toBe(parentElement);
	});

	it('should traverse all the way up to document.documentElement when no scrollable parent found', () => {
		const grandparent = document.createElement('div');
		const parent = document.createElement('div');
		const element = document.createElement('div');

		grandparent.appendChild(parent);
		parent.appendChild(element);
		mount(grandparent);

		// Ensure no element has scrollable overflow
		grandparent.style.overflow = 'visible';
		parent.style.overflow = 'visible';
		element.style.overflow = 'visible';

		const result = getScrollableParent(element);
		expect(result).toBe(document.documentElement);
	});
});
