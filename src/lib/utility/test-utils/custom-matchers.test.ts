import '~/lib/utility/test-utils/custom-matchers';

import { describe, expect, it, vi } from 'vitest';

describe('toHaveBeenCalledWithFirstArgs', () => {
	it('should pass when the first argument matches', () => {
		const mockFn = vi.fn();
		mockFn('firstArg', 'secondArg');
		expect(mockFn).toHaveBeenCalledWithFirstArgs('firstArg');
	});

	it('should pass when the first arguments match', () => {
		const mockFn = vi.fn();
		mockFn('firstArg', 'secondArg', 'thirdArg');
		expect(mockFn).toHaveBeenCalledWithFirstArgs('firstArg', 'secondArg');
	});

	it('should fail when the first arguments do not match', () => {
		const mockFn = vi.fn();
		mockFn('firstArg', 'secondArg');
		expect(() => {
			expect(mockFn).toHaveBeenCalledWithFirstArgs('wrongArg');
		}).toThrow();
	});

	it('should pass when multiple calls have matching first arguments', () => {
		const mockFn = vi.fn();
		mockFn('firstArg1', 'secondArg1');
		mockFn('firstArg2', 'secondArg2');
		expect(mockFn).toHaveBeenCalledWithFirstArgs('firstArg1');
		expect(mockFn).toHaveBeenCalledWithFirstArgs('firstArg2');
	});

	it('should fail if none of the calls match the first arguments', () => {
		const mockFn = vi.fn();
		mockFn('firstArg1', 'secondArg1');
		mockFn('firstArg2', 'secondArg2');
		expect(() => {
			expect(mockFn).toHaveBeenCalledWithFirstArgs('nonMatchingArg');
		}).toThrow();
	});
});
