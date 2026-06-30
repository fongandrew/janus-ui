import { afterEach, describe, expect, it, vi } from 'vitest';

import { JS_ATTR } from '~/lib2/dom/config';
import { _resetDispatchForTests, registerBehavior } from '~/lib2/dom/dispatch';
import { mount, unmount } from '~/lib2/dom/mount';

afterEach(() => {
	_resetDispatchForTests();
	unmount();
	document.body.innerHTML = '';
});

describe('registerBehavior + dispatch', () => {
	it('invokes the click handler when the event target carries the token', () => {
		const onClick = vi.fn();
		registerBehavior('t-test-click', { click: onClick });
		document.body.innerHTML = `<button id="btn" ${JS_ATTR}="t-test-click">Go</button>`;
		mount();

		document.getElementById('btn')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onClick.mock.calls[0]![0]).toBe(document.getElementById('btn'));
	});

	it('walks the data-js ancestor chain, not just the event target', () => {
		const onClick = vi.fn();
		registerBehavior('t-test-ancestor', { click: onClick });
		document.body.innerHTML = `
			<div id="outer" ${JS_ATTR}="t-test-ancestor">
				<span id="inner">click me</span>
			</div>
		`;
		mount();

		document.getElementById('inner')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(onClick).toHaveBeenCalledTimes(1);
		expect(onClick.mock.calls[0]![0]).toBe(document.getElementById('outer'));
	});

	it('fires every behavior listed in a space-separated data-js value, in source order', () => {
		const calls: string[] = [];
		registerBehavior('t-first', { click: () => calls.push('first') });
		registerBehavior('t-second', { click: () => calls.push('second') });
		document.body.innerHTML = `<button id="btn" ${JS_ATTR}="t-first t-second">Go</button>`;
		mount();

		document.getElementById('btn')!.dispatchEvent(new MouseEvent('click', { bubbles: true }));

		expect(calls).toEqual(['first', 'second']);
	});

	it('skips unregistered tokens and behaviors without a handler for this event', () => {
		const onClick = vi.fn();
		registerBehavior('t-no-click', { keydown: vi.fn() });
		document.body.innerHTML = `<button id="btn" ${JS_ATTR}="t-unregistered t-no-click">Go</button>`;
		mount();

		expect(() =>
			document
				.getElementById('btn')!
				.dispatchEvent(new MouseEvent('click', { bubbles: true })),
		).not.toThrow();
		expect(onClick).not.toHaveBeenCalled();
	});

	it('fires the mount hook for elements present at mount() time', () => {
		const onMount = vi.fn();
		registerBehavior('t-test-mount', { mount: onMount });
		document.body.innerHTML = `<div id="el" ${JS_ATTR}="t-test-mount"></div>`;
		mount();

		expect(onMount).toHaveBeenCalledTimes(1);
		expect(onMount.mock.calls[0]![0]).toBe(document.getElementById('el'));
	});

	it('fires the mount hook for nodes added after mount() via MutationObserver', async () => {
		const onMount = vi.fn();
		registerBehavior('t-test-late-mount', { mount: onMount });
		mount();

		const el = document.createElement('div');
		el.id = 'late';
		el.setAttribute(JS_ATTR, 't-test-late-mount');
		document.body.appendChild(el);

		await new Promise((resolve) => queueMicrotask(resolve as () => void));
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(onMount).toHaveBeenCalledTimes(1);
	});
});
