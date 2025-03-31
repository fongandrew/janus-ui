import { throttle } from '~/shared/utility/throttle';

describe('throttle', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should execute function immediately by default', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100);

		throttled();
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should not execute more than once within wait period', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100);

		throttled();
		throttled();
		throttled();
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should execute trailing call after wait period', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100);

		throttled();
		throttled();
		vi.advanceTimersByTime(100);
		expect(func).toHaveBeenCalledTimes(2);
	});

	it('should maintain correct this context', () => {
		const context = { value: 42 };
		const func = vi.fn(function (this: typeof context) {
			return this.value;
		});
		const throttled = throttle(func, 100);

		const result = throttled.call(context);
		expect(result).toBe(42);
	});

	it('should pass correct arguments', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100);

		throttled(1, 'test');
		expect(func).toHaveBeenCalledWith(1, 'test');
	});

	it('should respect leading: false option', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100, { leading: false });

		throttled();
		expect(func).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should respect trailing: false option', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100, { trailing: false });

		throttled();
		throttled();
		vi.advanceTimersByTime(100);
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should cancel delayed calls when cancel is called', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100);

		throttled();
		throttled();
		throttled.cancel();
		vi.advanceTimersByTime(100);
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should execute pending call when flush is called', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100);

		throttled();
		throttled();
		throttled.flush();
		expect(func).toHaveBeenCalledTimes(2);
	});
});
