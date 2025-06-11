import { getDefaultLogger } from '~/shared/utility/logger';

// Circuit breaker configuration
export interface CircuitBreakerConfig {
	failureThreshold: number;
	timeWindow: number; // milliseconds
	resetTimeout: number; // milliseconds
}

export const DEFAULT_CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
	failureThreshold: 5, // Number of failures before breaking circuit
	timeWindow: 60 * 1000, // Up to 1 minute between errors to count towards threshold
	resetTimeout: 5 * 60 * 1000, // 5 minutes before attempting reset
};

export const CIRCUIT_STATE = {
	OK: 'OK' as const, // Normal operation, requests allowed
	ERR: 'ERR' as const, // Blocking requests due to failures
	TEST: 'TEST' as const, // Testing if service is recovered
} as const;

export type CircuitState = (typeof CIRCUIT_STATE)[keyof typeof CIRCUIT_STATE];

export interface CircuitBreakerRecord {
	state: CircuitState;
	failureCount: number;
	lastFailureTime: number;
	nextAttemptTime: number;
}

export class CircuitBreaker {
	private state: CircuitState = CIRCUIT_STATE.OK;
	private failureCount = 0;
	private lastFailureTime = 0;
	private nextAttemptTime = 0;

	constructor(
		private name: string,
		private readonly config: CircuitBreakerConfig = DEFAULT_CIRCUIT_BREAKER_CONFIG,
	) {}

	/**
	 * Check if a request can be made
	 */
	allowRequest(): boolean {
		const now = Date.now();

		switch (this.state) {
			case CIRCUIT_STATE.OK:
				return true;
			case CIRCUIT_STATE.ERR:
				if (now >= this.nextAttemptTime) {
					// Transition to testing to see if service is recovered
					this.state = CIRCUIT_STATE.TEST;
					getDefaultLogger().info(`Circuit breaker testing for ${this.name}`);
					return true;
				}
				return false;
			case CIRCUIT_STATE.TEST:
				return true;
			default:
				return true;
		}
	}

	/**
	 * Record a successful operation
	 */
	recordSuccess(): void {
		if (this.state !== CIRCUIT_STATE.OK) {
			this.reset();
		}
	}

	/**
	 * Record a failed operation
	 */
	recordFailure(): void {
		const now = Date.now();

		// Reset failure count if outside time window
		if (now - this.lastFailureTime > this.config.timeWindow) {
			this.failureCount = 0;
		}

		this.failureCount++;
		this.lastFailureTime = now;

		if (
			this.state === CIRCUIT_STATE.TEST ||
			this.failureCount >= this.config.failureThreshold
		) {
			this.state = CIRCUIT_STATE.ERR;
			this.nextAttemptTime = now + this.config.resetTimeout;
			getDefaultLogger().warn(
				`Circuit breaker failed for ${this.name} after ${this.failureCount} failures`,
			);
		}
	}

	/**
	 * Get current circuit breaker status
	 */
	status(): CircuitBreakerRecord {
		return {
			state: this.state,
			failureCount: this.failureCount,
			lastFailureTime: this.lastFailureTime,
			nextAttemptTime: this.nextAttemptTime,
		};
	}

	/**
	 * Reset the circuit breaker to closed state
	 */
	reset(): void {
		this.state = CIRCUIT_STATE.OK;
		this.failureCount = 0;
		this.lastFailureTime = 0;
		this.nextAttemptTime = 0;
		getDefaultLogger().info(`Circuit breaker reset for ${this.name}`);
	}
}
