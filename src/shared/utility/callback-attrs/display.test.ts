import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setAttrs } from '~/shared/utility/attribute';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import {
	createAfterHideCallback,
	createBeforeShowCallback,
	runAfterHideCallbacks,
	runBeforeShowCallbacks,
} from '~/shared/utility/callback-attrs/display';
import { mount, mountStr } from '~/shared/utility/test-utils/mount';

describe('display callbacks', () => {
	beforeEach(() => {
		const div = document.createElement('div');

		// Verify these still aren't implemented yet before we mock it out
		// See https://github.com/jsdom/jsdom/issues/3851
		expect(() => div.closest(':modal')).toThrow();
		expect(() => div.closest(':popover-open')).toThrow();

		const closest = HTMLElement.prototype.closest;
		vi.spyOn(HTMLElement.prototype, 'closest').mockImplementation(function (
			this: any,
			selector,
		) {
			// Doesn't have to be `:invalid`, just pick any pseudo-selector that makes sense
			return closest.call(this, selector.replace(/(:modal|:popover-open)/g, ':invalid'));
		});
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

			runCallbacks(container);

			expect(parentCallback).toHaveBeenCalledTimes(1);
			expect(childCallback).not.toHaveBeenCalled();
		});
	});
});
