import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setAttrs } from '~/lib/utility/attribute';
import { callbackAttrs } from '~/lib/utility/callback-attrs/callback-registry';
import {
	createAfterHideCallback,
	createBeforeShowCallback,
	runAfterHideCallbacks,
	runBeforeShowCallbacks,
} from '~/lib/utility/callback-attrs/display';
import { mockPseudoClass } from '~/lib/utility/test-utils/mock-pseudo-class';
import { mount, mountStr } from '~/lib/utility/test-utils/mount';

describe('display callbacks', () => {
	beforeEach(() => {
		mockPseudoClass(':modal', '[data-test-modal]');
		mockPseudoClass(':popover-open', '[data-test-popover-open]');
	});

	describe.each([
		{
			callbackType: 'beforeShow',
			createCallback: createBeforeShowCallback,
			runCallbacks: runBeforeShowCallbacks,
		},
		{
			callbackType: 'afterHide',
			createCallback: createAfterHideCallback,
			runCallbacks: runAfterHideCallbacks,
		},
	])('run$callbackType callbacks', ({ callbackType, createCallback, runCallbacks }) => {
		it(`should run ${callbackType} callbacks on the container`, () => {
			const callback = vi.fn();
			const container = document.createElement('div');
			const callbackFn = createCallback(`$p-test__${Math.random()}`, callback);

			setAttrs(container, callbackAttrs(callbackFn));
			mount(container);

			runCallbacks(container);

			expect(callback).toHaveBeenCalledTimes(1);
			expect(callback).toHaveBeenCalledWith(container, container);
		});

		it(`should run ${callbackType} callbacks on child elements`, () => {
			const childCallback = vi.fn();

			const callbackFn = createCallback(`$p-test__${Math.random()}`, childCallback);

			const container = mountStr(`
				<div id="container">
					<div id="child"></div>
				</div>
			`).querySelector('#container') as HTMLElement;
			const childEl = container.querySelector('#child') as HTMLElement;
			setAttrs(childEl, callbackAttrs(callbackFn));

			runCallbacks(container);

			expect(childCallback).toHaveBeenCalledTimes(1);
			expect(childCallback).toHaveBeenCalledWith(childEl, container);
		});

		it(`should not run ${callbackType} callbacks on elements inside visibility boundaries`, () => {
			const parentCallback = vi.fn();
			const childCallback = vi.fn();

			const callback1 = createCallback(`$p-test__${Math.random()}`, parentCallback);
			const callback2 = createCallback(`$p-test__${Math.random()}`, childCallback);

			const container = mountStr(`
				<div id="parent" aria-hidden="true">
					<div id="hidden-boundary" aria-hidden="true">
						<div id="child"></div>
					</div>
				</div>
			`);
			const parent = container.querySelector('#parent') as HTMLElement;
			setAttrs(parent, callbackAttrs(callback1));
			const child = container.querySelector('#child') as HTMLElement;
			setAttrs(child, callbackAttrs(callback2));

			runCallbacks(parent);

			expect(parentCallback).toHaveBeenCalledTimes(1);
			expect(childCallback).not.toHaveBeenCalled();
		});
	});
});
