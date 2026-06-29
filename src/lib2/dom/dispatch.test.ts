import { afterEach, describe, expect, it, vi } from 'vitest';

import { dispatchMount, hasMountHook, registerBehavior } from '~/lib2/dom/dispatch';

afterEach(() => {
	document.body.innerHTML = '';
});

describe('registerBehavior + dispatch', () => {
	it('routes an event to the behavior named on data-js', () => {
		const spy = vi.fn();
		registerBehavior('t-test-click', { click: spy });

		const btn = document.createElement('button');
		btn.setAttribute('data-js', 't-test-click');
		document.body.append(btn);

		btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(spy).toHaveBeenCalledOnce();
		expect(spy.mock.calls[0]![0]).toBe(btn);
	});

	it('walks the ancestor chain from the target upward', () => {
		const spy = vi.fn();
		registerBehavior('t-test-ancestor', { click: spy });

		const outer = document.createElement('div');
		outer.setAttribute('data-js', 't-test-ancestor');
		const inner = document.createElement('button');
		outer.append(inner);
		document.body.append(outer);

		inner.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(spy).toHaveBeenCalledOnce();
		expect(spy.mock.calls[0]![0]).toBe(outer);
	});

	it('fires multiple behaviors on one element in source order', () => {
		const order: string[] = [];
		registerBehavior('t-test-a', { click: () => order.push('a') });
		registerBehavior('t-test-b', { click: () => order.push('b') });

		const btn = document.createElement('button');
		btn.setAttribute('data-js', 't-test-a t-test-b');
		document.body.append(btn);

		btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(order).toEqual(['a', 'b']);
	});

	it('ignores tokens with no registered behavior', () => {
		const btn = document.createElement('button');
		btn.setAttribute('data-js', 't-does-not-exist');
		document.body.append(btn);
		expect(() => btn.dispatchEvent(new MouseEvent('click', { bubbles: true }))).not.toThrow();
	});
});

describe('mount hooks', () => {
	it('detects and runs mount hooks', () => {
		const spy = vi.fn();
		registerBehavior('t-test-mount', { mount: spy });

		const el = document.createElement('div');
		el.setAttribute('data-js', 't-test-mount');
		expect(hasMountHook(el)).toBe(true);

		dispatchMount(el);
		expect(spy).toHaveBeenCalledOnce();
		expect(spy).toHaveBeenCalledWith(el);
	});
});
