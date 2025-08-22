import { describe, expect, it, vi } from 'vitest';

import type { Logger } from '~/lib/utility/logger';
import { consoleLogger, getDefaultLogger, setDefaultLogger } from '~/lib/utility/logger';

describe('logger', () => {
	describe('consoleLogger', () => {
		it('should have all required methods', () => {
			expect(consoleLogger.debug).toBeTypeOf('function');
			expect(consoleLogger.debugWarn).toBeTypeOf('function');
			expect(consoleLogger.info).toBeTypeOf('function');
			expect(consoleLogger.warn).toBeTypeOf('function');
			expect(consoleLogger.error).toBeTypeOf('function');
		});
	});

	describe('getDefaultLogger', () => {
		it('should return the same logger instance on multiple calls', () => {
			const logger1 = getDefaultLogger();
			const logger2 = getDefaultLogger();
			expect(logger1).toBe(logger2);
		});

		it('should initially use consoleLogger behavior', () => {
			const logger = getDefaultLogger();
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

			logger.warn('test message');
			expect(consoleSpy).toHaveBeenCalledWith('test message');
		});
	});

	describe('setDefaultLogger and dynamic wrapper behavior', () => {
		it('should update behavior for existing logger references', () => {
			// Get logger reference before setting custom logger
			const earlyLogger = getDefaultLogger();

			// Create mock logger
			const mockLogger: Logger = {
				debug: vi.fn(),
				debugWarn: vi.fn(),
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			};

			// Set new logger
			setDefaultLogger(mockLogger);

			// The early reference should now use the mock logger
			earlyLogger.warn('test message');
			earlyLogger.error('error message');
			earlyLogger.info('info message');
			earlyLogger.debug('debug message');
			earlyLogger.debugWarn('debug warn message');

			expect(mockLogger.warn).toHaveBeenCalledWith('test message');
			expect(mockLogger.error).toHaveBeenCalledWith('error message');
			expect(mockLogger.info).toHaveBeenCalledWith('info message');
			expect(mockLogger.debug).toHaveBeenCalledWith('debug message');
			expect(mockLogger.debugWarn).toHaveBeenCalledWith('debug warn message');
		});

		it('should work with multiple logger changes', () => {
			const earlyLogger = getDefaultLogger();

			// First mock logger
			const mockLogger1: Logger = {
				debug: vi.fn(),
				debugWarn: vi.fn(),
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			};

			// Second mock logger
			const mockLogger2: Logger = {
				debug: vi.fn(),
				debugWarn: vi.fn(),
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			};

			// Set first logger
			setDefaultLogger(mockLogger1);
			earlyLogger.warn('message 1');
			expect(mockLogger1.warn).toHaveBeenCalledWith('message 1');
			expect(mockLogger2.warn).not.toHaveBeenCalled();

			// Set second logger
			setDefaultLogger(mockLogger2);
			earlyLogger.warn('message 2');
			expect(mockLogger2.warn).toHaveBeenCalledWith('message 2');
			// mockLogger1 should not receive new calls
			expect(mockLogger1.warn).toHaveBeenCalledTimes(1);
		});

		it('should work for new logger references after setDefaultLogger', () => {
			const mockLogger: Logger = {
				debug: vi.fn(),
				debugWarn: vi.fn(),
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			};

			setDefaultLogger(mockLogger);

			// Get logger reference after setting custom logger
			const newLogger = getDefaultLogger();

			newLogger.error('test error');
			expect(mockLogger.error).toHaveBeenCalledWith('test error');
		});

		it('should maintain consistent behavior across all references', () => {
			const earlyLogger = getDefaultLogger();

			const mockLogger: Logger = {
				debug: vi.fn(),
				debugWarn: vi.fn(),
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			};

			setDefaultLogger(mockLogger);

			const laterLogger = getDefaultLogger();

			// Both references should use the same underlying logger
			earlyLogger.info('early message');
			laterLogger.info('later message');

			expect(mockLogger.info).toHaveBeenCalledTimes(2);
			expect(mockLogger.info).toHaveBeenCalledWith('early message');
			expect(mockLogger.info).toHaveBeenCalledWith('later message');
		});

		it('should restore to consoleLogger when set back', () => {
			const logger = getDefaultLogger();

			// Set mock logger
			const mockLogger: Logger = {
				debug: vi.fn(),
				debugWarn: vi.fn(),
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
			};

			setDefaultLogger(mockLogger);
			logger.warn('mock message');
			expect(mockLogger.warn).toHaveBeenCalledWith('mock message');

			// Restore console logger
			setDefaultLogger(consoleLogger);

			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			logger.warn('console message');
			expect(consoleSpy).toHaveBeenCalledWith('console message');
		});
	});
});
