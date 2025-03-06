import { createCallbackRegistry } from '~/shared/utility/callback-registry';

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

	it('should create props object with specified attribute and IDs', () => {
		const registry = createCallbackRegistry('data-test');

		const testCallback1 = registry.create('id1', () => {});
		const testCallback2 = registry.create('id2', () => {});
		const props = registry.props(testCallback1, null, undefined, testCallback2(), 'other', {
			'data-test': 'prev more',
		});

		expect(props).toEqual({ 'data-test': 'id1 id2 other prev more' });
	});

	it('should extend props object with additional IDs', () => {
		const registry = createCallbackRegistry('data-test');
		const extendProps = registry.extendProps('id4', 'id5');
		const extendedProps = extendProps['data-test']('id1 id2');

		expect(extendedProps).toBe('id1 id2 id4 id5');
	});
});
