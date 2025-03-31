import { vi } from 'vitest';

import { onUnmount } from '~/shared/utility/unmount-observer';

describe('onUnmount', () => {
	let toRemove: HTMLElement[] = [];

	const mount = (elm: HTMLElement) => {
		toRemove.push(elm);
		document.body.appendChild(elm);
	};

	afterEach(() => {
		// Clean up DOM
		for (const elm of toRemove) {
			if (elm.isConnected) {
				elm.remove();
			}
		}

		toRemove = [];
	});

	it('should call callback when element is removed from DOM', async () => {
		const element = document.createElement('div');
		mount(element);

		const callback = vi.fn();
		onUnmount(element, callback);

		await Promise.resolve();
		expect(callback).not.toHaveBeenCalled();

		element.remove();
		await Promise.resolve();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it("should call the callback when element's parent is removed from DOM", async () => {
		const element = document.createElement('div');
		const parent = document.createElement('div');
		parent.appendChild(element);
		mount(parent);

		const callback = vi.fn();
		onUnmount(element, callback);

		parent.remove();
		await Promise.resolve();
		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should not call the callback when other elements are removed', async () => {
		const element1 = document.createElement('div');
		const element2 = document.createElement('div');
		mount(element1);
		mount(element2);

		const callback = vi.fn();
		onUnmount(element1, callback);

		element2.remove();
		await Promise.resolve();
		expect(callback).not.toHaveBeenCalled();
	});

	it('should disconnect observer when all elements are removed', async () => {
		const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');

		const element = document.createElement('div');
		mount(element);

		const callback = vi.fn();
		onUnmount(element, callback);

		element.remove();
		await Promise.resolve();
		expect(callback).toHaveBeenCalledTimes(1);

		// Check disconnect called
		expect(disconnect).toHaveBeenCalled();

		// Remove the element again and remove to see if it triggers the observer
		mount(element);
		element.remove();
		await Promise.resolve();
		expect(callback).toHaveBeenCalledTimes(1);
	});
});
