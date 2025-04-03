import { describe, expect, it, vi } from 'vitest';

import { setAttrs } from '~/shared/utility/attribute';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { createMounter, processRoot } from '~/shared/utility/callback-attrs/mount';
import { mount, mountStr } from '~/shared/utility/test-utils/mount';

describe('mount callbacks', () => {
	it('should run mount callbacks on elements when processRoot is called', () => {
		const callback = vi.fn();
		const elm = document.createElement('div');
		const callbackFn = createMounter(`$p-test__${Math.random()}`, callback);

		setAttrs(elm, callbackAttrs(callbackFn));
		mount(elm);

		processRoot(document);

		expect(callback).toHaveBeenCalledTimes(1);
		expect(callback).toHaveBeenCalledWith(elm);
	});

	it('should run mount callbacks on child elements when processRoot is called', () => {
		const childCallback = vi.fn();
		const callbackFn = createMounter(`$p-test__${Math.random()}`, childCallback);

		const container = mountStr(`
			<div id="container">
				<div id="child"></div>
			</div>
		`).querySelector('#container') as HTMLElement;
		const childEl = container.querySelector('#child') as HTMLElement;
		setAttrs(childEl, callbackAttrs(callbackFn));

		processRoot(document);

		expect(childCallback).toHaveBeenCalledTimes(1);
		expect(childCallback).toHaveBeenCalledWith(childEl);
	});

	it('should only process an element once even if processRoot is called multiple times', () => {
		const callback = vi.fn();
		const elm = document.createElement('div');
		const callbackFn = createMounter(`$p-test__${Math.random()}`, callback);

		setAttrs(elm, callbackAttrs(callbackFn));
		mount(elm);

		processRoot(document);
		processRoot(document);

		expect(callback).toHaveBeenCalledTimes(1);
	});

	it('should be able to run multiple callbacks on the same element', () => {
		const callback1 = vi.fn();
		const callback2 = vi.fn();
		const elm = document.createElement('div');

		const callbackFn1 = createMounter(`$p-test-1__${Math.random()}`, callback1);
		const callbackFn2 = createMounter(`$p-test-2__${Math.random()}`, callback2);

		setAttrs(elm, callbackAttrs(callbackFn1, callbackFn2));
		mount(elm);

		processRoot(document);

		expect(callback1).toHaveBeenCalledTimes(1);
		expect(callback1).toHaveBeenCalledWith(elm);
		expect(callback2).toHaveBeenCalledTimes(1);
		expect(callback2).toHaveBeenCalledWith(elm);
	});
});
