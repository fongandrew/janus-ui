import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { _resetDispatch, installDispatch, registerBehavior, runMount } from '~/lib2/dom/dispatch';

describe('dispatch', () => {
	beforeEach(() => {
		_resetDispatch();
		document.body.innerHTML = '';
	});
	afterEach(() => _resetDispatch());

	it('dispatches an event to a behavior on an ancestor', () => {
		const calls: string[] = [];
		registerBehavior('t-x', { click: (el) => calls.push(el.id) });
		installDispatch();
		document.body.innerHTML = '<div id="a" data-js="t-x"><button id="b">x</button></div>';
		document.getElementById('b')!.click();
		expect(calls).toEqual(['a']);
	});

	it('runs multiple behaviors on one element in source order', () => {
		const calls: string[] = [];
		registerBehavior('t-a', { click: () => calls.push('a') });
		registerBehavior('t-b', { click: () => calls.push('b') });
		installDispatch();
		document.body.innerHTML = '<button id="b" data-js="t-a t-b">x</button>';
		document.getElementById('b')!.click();
		expect(calls).toEqual(['a', 'b']);
	});

	it('installs a listener for a behavior registered after install', () => {
		const calls: string[] = [];
		installDispatch();
		registerBehavior('t-late', { click: () => calls.push('late') });
		document.body.innerHTML = '<button id="b" data-js="t-late">x</button>';
		document.getElementById('b')!.click();
		expect(calls).toEqual(['late']);
	});

	it('fires the mount hook via runMount', () => {
		registerBehavior('t-m', { mount: (el) => el.setAttribute('data-mounted', '') });
		document.body.innerHTML = '<div id="a" data-js="t-m"></div>';
		runMount(document.getElementById('a')!);
		expect(document.getElementById('a')!.hasAttribute('data-mounted')).toBe(true);
	});
});
