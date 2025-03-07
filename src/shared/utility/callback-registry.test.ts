import {
	callbackAttrMods,
	callbackAttrs,
	createCallbackRegistry,
} from '~/shared/utility/callback-registry';

describe('createCallbackRegistry', () => {
	it('should create and register a callback', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = vi.fn();
		const testCallback = registry.create('testCallback', callback);

		const retrievedCallback = registry.get(testCallback());
		expect(retrievedCallback).toBeDefined();
	});

	it('should allow callbaack to be unregistered with .rm', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = vi.fn();
		const testCallback = registry.create('testCallback', callback);

		const callbackId = testCallback();
		testCallback.rm();
		const retrievedCallback = registry.get(callbackId);
		expect(retrievedCallback).not.toBeDefined();
	});

	it('should allow callback to invoked via .do', () => {
		const registry = createCallbackRegistry('data-test');
		const callback = vi.fn();
		const testCallback = registry.create('testCallback', callback);

		testCallback.do();
		expect(callback).toHaveBeenCalled();
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
		const callback = registry.create('test-id', () => {});

		const props = callbackAttrs(callback, {
			'data-test': 'manual-id',
			'data-other': 'should-not-appear',
		});

		expect(props).toEqual({
			'data-test': 'test-id manual-id',
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
});
