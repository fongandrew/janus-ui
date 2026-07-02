import { beforeEach, describe, expect, it, vi } from 'vitest';

import { activateDispatch, fireMount, registerBehavior } from '~/lib2/dom/dispatch';

describe('dispatch', () => {
	beforeEach(() => {
		document.body.innerHTML = '';
		activateDispatch();
	});

	it('dispatches an event to the behavior on the target', () => {
		const handler = vi.fn();
		registerBehavior('t-test-click', { click: handler });
		document.body.innerHTML = '<button data-js="t-test-click">x</button>';
		const button = document.querySelector('button')!;
		button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(handler).toHaveBeenCalledTimes(1);
		expect(handler.mock.calls[0]![0]).toBe(button);
	});

	it('walks the data-js ancestor chain', () => {
		const handler = vi.fn();
		registerBehavior('t-test-ancestor', { click: handler });
		document.body.innerHTML =
			'<div data-js="t-test-ancestor"><span><em id="deep">x</em></span></div>';
		document.getElementById('deep')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(handler).toHaveBeenCalledTimes(1);
		expect((handler.mock.calls[0]![0] as Element).tagName).toBe('DIV');
	});

	it('runs multiple behaviors on one element in token order', () => {
		const calls: string[] = [];
		registerBehavior('t-test-first', { click: () => calls.push('first') });
		registerBehavior('t-test-second', { click: () => calls.push('second') });
		document.body.innerHTML = '<button data-js="t-test-first t-test-second">x</button>';
		document.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(calls).toEqual(['first', 'second']);
	});

	it('skips unregistered tokens and undeclared event types', () => {
		const handler = vi.fn();
		registerBehavior('t-test-keys', { keydown: handler });
		document.body.innerHTML = '<button data-js="t-unknown t-test-keys">x</button>';
		document.querySelector('button')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(handler).not.toHaveBeenCalled();
	});

	it('fires mount hooks via fireMount', () => {
		const mountHook = vi.fn();
		registerBehavior('t-test-mount', { mount: mountHook });
		document.body.innerHTML = '<div data-js="t-test-mount"></div>';
		fireMount(document.querySelector('div')!);
		expect(mountHook).toHaveBeenCalledTimes(1);
	});
});
