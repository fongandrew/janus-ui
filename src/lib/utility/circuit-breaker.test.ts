import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	CIRCUIT_STATE,
	CircuitBreaker,
	type CircuitBreakerConfig,
} from '~/lib/utility/circuit-breaker';
import { getDefaultLogger } from '~/lib/utility/logger';

describe('CircuitBreaker', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('initial state', () => {
		it('should start in OK state', () => {
			const breaker = new CircuitBreaker('test-breaker');
			const status = breaker.status();
			expect(status.state).toBe(CIRCUIT_STATE.OK);
			expect(status.failureCount).toBe(0);
			expect(status.lastFailureTime).toBe(0);
			expect(status.nextAttemptTime).toBe(0);
		});

		it('should allow requests initially', () => {
			const breaker = new CircuitBreaker('test-breaker');
			expect(breaker.allowRequest()).toBe(true);
		});

		it('should transition to ERR state after threshold failures', () => {
			const config: CircuitBreakerConfig = {
				failureThreshold: 3,
				timeWindow: 60 * 1000,
				resetTimeout: 5 * 60 * 1000,
			};
			const breaker = new CircuitBreaker('test-breaker', config);

			// Should stay in OK for first 2 failures
			breaker.recordFailure();
			breaker.recordFailure();
			expect(breaker.status().state).toBe(CIRCUIT_STATE.OK);

			// Should transition to ERR on 3rd failure
			vi.spyOn(getDefaultLogger(), 'warn').mockImplementation(() => {});
			breaker.recordFailure();
			expect(breaker.status().state).toBe(CIRCUIT_STATE.ERR);
		});

		it('should not transition to ERR state unless failures are within time window', () => {
			const config: CircuitBreakerConfig = {
				failureThreshold: 2,
				timeWindow: 1000, // 1 second
				resetTimeout: 5 * 60 * 1000,
			};
			const breaker = new CircuitBreaker('test-breaker', config);

			// Record first failure
			breaker.recordFailure();
			expect(breaker.status().state).toBe(CIRCUIT_STATE.OK);

			// Wait longer than time window before next failure
			vi.advanceTimersByTime(1100);
			breaker.recordFailure();
			expect(breaker.status().state).toBe(CIRCUIT_STATE.OK);
		});
	});

	describe('error state', () => {
		let breaker: CircuitBreaker;

		beforeEach(() => {
			const config: CircuitBreakerConfig = {
				failureThreshold: 2,
				timeWindow: 60 * 1000,
				resetTimeout: 5 * 60 * 1000,
			};
			breaker = new CircuitBreaker('test-breaker', config);

			breaker.recordFailure();
			vi.spyOn(getDefaultLogger(), 'warn').mockImplementation(() => {});
			breaker.recordFailure();
		});

		it('should not allow requests', () => {
			expect(breaker.allowRequest()).toBe(false);
			expect(breaker.status().state).toBe(CIRCUIT_STATE.ERR);
		});

		it('should not allow requests before reset timeout', () => {
			vi.advanceTimersByTime(5 * 60 * 1000 - 1);
			expect(breaker.allowRequest()).toBe(false);
			expect(breaker.status().state).toBe(CIRCUIT_STATE.ERR);
		});

		it('should transition to TEST state after reset timeout', () => {
			vi.advanceTimersByTime(5 * 60 * 1000 + 1);
			expect(breaker.allowRequest()).toBe(true);
			expect(breaker.status().state).toBe(CIRCUIT_STATE.TEST);
		});

		it('should transition to OK state after successful request in TEST state', () => {
			breaker.recordSuccess();
			expect(breaker.allowRequest()).toBe(true);
			expect(breaker.status().state).toBe(CIRCUIT_STATE.OK);
			expect(breaker.status().failureCount).toBe(0);
		});
	});

	describe('test state', () => {
		let breaker: CircuitBreaker;

		beforeEach(() => {
			const config: CircuitBreakerConfig = {
				failureThreshold: 2,
				timeWindow: 60 * 1000,
				resetTimeout: 100, // Short timeout for testing
			};
			breaker = new CircuitBreaker('test-breaker', config);

			breaker.recordFailure();
			vi.spyOn(getDefaultLogger(), 'warn').mockImplementation(() => {});
			breaker.recordFailure();
			expect(breaker.status().state).toBe(CIRCUIT_STATE.ERR);

			vi.advanceTimersByTime(101);
			expect(breaker.allowRequest()).toBe(true);
			expect(breaker.status().state).toBe(CIRCUIT_STATE.TEST);
		});

		it('should transition to OK state on successful request', () => {
			breaker.recordSuccess();
			expect(breaker.status().state).toBe(CIRCUIT_STATE.OK);
			expect(breaker.status().failureCount).toBe(0);
		});
	});
});
