import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerBehavior, fireMountForElement } from './dispatch';

describe('dispatch', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('registerBehavior registers and mount fires', () => {
		const mountFn = vi.fn();
		registerBehavior('test-mount-a', { mount: mountFn });

		const el = document.createElement('div');
		el.setAttribute('data-js', 'test-mount-a');
		document.body.appendChild(el);

		fireMountForElement(el);
		expect(mountFn).toHaveBeenCalledWith(el);
	});

	it('dispatches events to registered behaviors via bubbling', async () => {
		const clickFn = vi.fn();
		registerBehavior('test-click-b', { click: clickFn });

		const parent = document.createElement('div');
		parent.setAttribute('data-js', 'test-click-b');
		const child = document.createElement('button');
		parent.appendChild(child);
		document.body.appendChild(parent);

		child.click();
		expect(clickFn).toHaveBeenCalledWith(parent, expect.any(Event));
	});

	it('handles multiple behaviors on one element', () => {
		const fn1 = vi.fn();
		const fn2 = vi.fn();
		registerBehavior('test-multi-1', { click: fn1 });
		registerBehavior('test-multi-2', { click: fn2 });

		const el = document.createElement('div');
		el.setAttribute('data-js', 'test-multi-1 test-multi-2');
		document.body.appendChild(el);

		el.click();
		expect(fn1).toHaveBeenCalled();
		expect(fn2).toHaveBeenCalled();
	});

	it('skips behaviors not registered for event type', () => {
		const mountFn = vi.fn();
		registerBehavior('test-mount-only', { mount: mountFn });

		const el = document.createElement('div');
		el.setAttribute('data-js', 'test-mount-only');
		document.body.appendChild(el);

		el.click();
		expect(mountFn).not.toHaveBeenCalled();
	});
});
