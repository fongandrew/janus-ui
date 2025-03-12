import {
	callbackAttrMods,
	callbackAttrs,
	createCallbackRegistry,
	isRegisteredCallback,
} from '~/shared/utility/callback-attrs/callback-registry';

/**
 * Helper to apply callback attributes to an element
 */
function applyCallbackAttrs(element: HTMLElement, props: Record<string, string>): void {
	Object.entries(props).forEach(([attr, value]) => {
		element.setAttribute(attr, value);
	});
}

describe('createCallbackRegistry', () => {
	it('should create and register a callback', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = vi.fn();
		const testCallback = registry.create('testCallback', callback);

		testCallback();
		const retrievedCallback = registry.get(testCallback.id);
		expect(retrievedCallback).toBeDefined();
	});

	it('should allow callback to be unregistered with .rm()', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = vi.fn();
		const testCallback = registry.create('testCallback', callback);

		testCallback();
		testCallback.rm();
		const retrievedCallback = registry.get(testCallback.id);
		expect(retrievedCallback).not.toBeDefined();
	});

	it('should allow callback to be invoked via .do()', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = vi.fn();
		const testCallback = registry.create('testCallback', callback);

		const element = document.createElement('div');
		testCallback.do.call(element);
		expect(callback).toHaveBeenCalled();
	});

	describe('.iter', () => {
		it('should  iterate over callbacks', () => {
			const registry = createCallbackRegistry('data-test');
			const callback1 = vi.fn();
			const testCallback1 = registry.create('testCallback1', callback1);
			const callback2 = vi.fn();
			const testCallback2 = registry.create('testCallback2', callback2);

			const element = document.createElement('div');

			// Use callbackAttrs to generate the attributes and apply them to the element
			const props = callbackAttrs(testCallback1, testCallback2);
			applyCallbackAttrs(element, props);

			// Get the callback from the iterator
			const iterCallbacks = Array.from(registry.iter(element));
			expect(iterCallbacks.length).toBe(2);

			// Call the callback and check that 'this' is bound to the element
			iterCallbacks[0]?.();
			expect(callback1).toHaveBeenCalledWith();
			expect(callback1.mock.instances[0]).toBe(element);
			iterCallbacks[1]?.();
			expect(callback2).toHaveBeenCalledWith();
			expect(callback2.mock.instances[0]).toBe(element);
		});

		it('should  handle callbacks with arguments', () => {
			const registry = createCallbackRegistry('data-test');
			const callback = vi.fn();
			const testCallback = registry.create('testCallback', callback);

			testCallback.add();

			const element = document.createElement('div');

			// Use callbackAttrs to generate the attributes and apply them to the element
			const props = callbackAttrs(testCallback('arg1', 'arg2'), testCallback());
			applyCallbackAttrs(element, props);

			const iterCallbacks = Array.from(registry.iter(element));
			expect(iterCallbacks.length).toBe(2);

			iterCallbacks[0]?.();
			expect(callback).toHaveBeenCalledWith('arg1', 'arg2');
			expect(callback.mock.instances[0]).toBe(element);
			iterCallbacks[1]?.();
			expect(callback).toHaveBeenCalledWith();
			expect(callback.mock.instances[1]).toBe(element);
		});

		it('should  memoize bound callbacks for better performance', () => {
			const registry = createCallbackRegistry('data-test');
			const callback = vi.fn();
			const testCallback = registry.create('testCallback', callback);

			const element = document.createElement('div');

			// Use callbackAttrs to generate the attributes and apply them to the element
			const props = callbackAttrs(testCallback('arg1', 'arg2'));
			applyCallbackAttrs(element, props);

			// First iteration
			const firstIter = Array.from(registry.iter(element));
			const boundFn1 = firstIter[0];

			// Second iteration - should return the same bound function instance
			const secondIter = Array.from(registry.iter(element));
			const boundFn2 = secondIter[0];

			expect(boundFn1).toBe(boundFn2);
		});

		it('should unmemoize if attributes change', () => {
			const registry = createCallbackRegistry('data-test');
			const callback = vi.fn();
			const testCallback = registry.create('testCallback', callback);

			const element = document.createElement('div');

			// Use callbackAttrs to generate the initial attributes and apply them to the element
			const props1 = callbackAttrs(testCallback('arg1', 'arg2'));
			applyCallbackAttrs(element, props1);

			// First iteration
			const firstIter = Array.from(registry.iter(element));
			const boundFn1 = firstIter[0];

			// Change the props using callbackAttrs with different arguments
			const props2 = callbackAttrs(testCallback('arg3', 'arg4'));
			applyCallbackAttrs(element, props2);

			// Second iteration - should return a new bound function instance
			const secondIter = Array.from(registry.iter(element));
			const boundFn2 = secondIter[0];

			expect(boundFn1).not.toBe(boundFn2);

			// Change back to original props
			applyCallbackAttrs(element, props1);

			// Third iteration - should not return the original bound function instance
			// (so we don't leak memory)
			const thirdIter = Array.from(registry.iter(element));
			const boundFn3 = thirdIter[0];

			expect(boundFn1).not.toBe(boundFn3);
		});
	});
});

describe('callbackAttrs', () => {
	it('should create props object with callback IDs under respective attributes', () => {
		const registry1 = createCallbackRegistry('data-test');
		const registry2 = createCallbackRegistry('data-action');

		const testCallback = registry1.create('test-id', () => {});
		const actionCallback = registry2.create('action-id', () => {});

		const props = callbackAttrs(testCallback, actionCallback);

		expect(props).toEqual({
			'data-test': 'test-id',
			'data-action': 'action-id',
		});
	});

	it('should handle falsey values properly', () => {
		const registry = createCallbackRegistry('data-test');
		const testCallback = registry.create('test-id', () => {});

		const props = callbackAttrs(testCallback, null, undefined, false);

		expect(props).toEqual({
			'data-test': 'test-id',
		});
	});

	it('should combine multiple callbacks with the same attribute', () => {
		const registry = createCallbackRegistry('data-test');
		const callback1 = registry.create('id1', () => {});
		const callback2 = registry.create('id2', () => {});

		const props = callbackAttrs(callback1, callback2);

		expect(props).toEqual({
			'data-test': 'id1 id2',
		});
	});

	it('should extract relevant attributes from object props', () => {
		const registry = createCallbackRegistry('data-test');
		const callback1 = registry.create('test-id-1', () => {});
		const callback2 = registry.create('test-id-2', () => {});

		const props = callbackAttrs(
			callback1,
			{
				'data-test': 'manual-id',
				'data-other': 'should-not-appear',
			},
			callback2,
		);

		expect(props).toEqual({
			'data-test': 'test-id-1 manual-id test-id-2',
		});
	});
});

describe('callbackAttrMods', () => {
	it('should append IDs to existing attribute values', () => {
		const registry = createCallbackRegistry('data-test');
		const callback1 = registry.create('id1', () => {});
		const callback2 = registry.create('id2', () => {});

		const modProps = callbackAttrMods(callback1, callback2);
		const result = modProps['data-test']!('existing-id');

		expect(result).toBe('existing-id id1 id2');
	});

	it('should create a modifier function for each attribute', () => {
		const registry1 = createCallbackRegistry('data-test');
		const registry2 = createCallbackRegistry('data-action');

		const testCallback = registry1.create('test-id', () => {});
		const actionCallback = registry2.create('action-id', () => {});

		const modProps = callbackAttrMods(testCallback, actionCallback);

		expect(modProps['data-test']!('prev-test')).toBe('prev-test test-id');
		expect(modProps['data-action']!('prev-action')).toBe('prev-action action-id');
	});

	it('should work when no previous value exists', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = registry.create('test-id', () => {});

		const modProps = callbackAttrMods(callback);
		const result = modProps['data-test']!(undefined);

		expect(result).toBe('test-id');
	});

	it('should handle falsey values properly', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = registry.create('test-id', () => {});

		const modProps = callbackAttrMods(callback, null, undefined);
		const result = modProps['data-test']!('existing');

		expect(result).toBe('existing test-id');
	});

	it('should handle callbacks with args', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = registry.create('test-id', () => {});

		const modProps = callbackAttrMods(callback('arg1', 'arg2'), callback('arg3', 'arg4'));
		const result = modProps['data-test']!('existing');

		expect(result).toBe('existing test-id (arg1,arg2) test-id (arg3,arg4)');
	});
});

describe('isRegisteredCallback', () => {
	it('should identify registered callbacks', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = registry.create('test-id', () => {});

		expect(isRegisteredCallback(callback)).toBe(true);
		expect(isRegisteredCallback(() => {})).toBe(false);
		expect(isRegisteredCallback({})).toBe(false);
		expect(isRegisteredCallback(null)).toBe(false);
	});
});

describe('callbackSelector', () => {
	it('should create a selector using the callback id property', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = registry.create('test-id', () => {});

		expect(callback.id).toBe('test-id');
		expect(`[${callback.attr}~="${callback.id}"]`).toBe('[data-test~="test-id"]');
	});
});
