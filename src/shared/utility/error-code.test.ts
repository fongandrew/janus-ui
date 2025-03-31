import { getErrorCode } from '~/shared/utility/error-code';

describe('getErrorCode', () => {
	it('should generate a consistent error code for the same error', () => {
		// Create test error
		const testError = new Error('Test error message');
		testError.name = 'TestError';

		// Get error code multiple times
		const errorCode1 = getErrorCode(testError);
		const errorCode2 = getErrorCode(testError);

		// Verify consistency
		expect(errorCode1).toBe(errorCode2);

		// Verify format of error code (should be two base-36 strings separated by a hyphen)
		expect(errorCode1).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
	});

	it('should generate different error codes for different errors', () => {
		// Create different test errors
		const error1 = new Error('First error message');
		const error2 = new Error('Second error message');

		// Get error codes
		const errorCode1 = getErrorCode(error1);
		const errorCode2 = getErrorCode(error2);

		// Verify they are different
		expect(errorCode1).not.toBe(errorCode2);
	});

	it('should handle errors without a stack trace', () => {
		// Create test error with no stack
		const testError = new Error('No stack error');
		delete testError.stack;

		// Get error code
		const errorCode = getErrorCode(testError);

		// Verify format of error code
		expect(errorCode).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
	});

	it('should generate different codes for errors with same message but different names', () => {
		const error1 = new Error('Same message');
		error1.name = 'TypeError';

		const error2 = new Error('Same message');
		error2.name = 'RangeError';

		expect(getErrorCode(error1)).not.toBe(getErrorCode(error2));
	});
});
