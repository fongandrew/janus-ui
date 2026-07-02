/** Route all calls to console through this interface / middleware for customization */
export interface Logger {
	/** Log a dev only message */
	debug: typeof console.debug;
	/** Log a dev only warning */
	debugWarn: typeof console.warn;
	/** Log an informational message */
	info: typeof console.info;
	/** Log a warning */
	warn: typeof console.warn;
	/** Log an error */
	error: typeof console.error;
}

/**
 * Original console logger that preserves the console logging behavior
 * including not logging debug levels in prod and not logging info in test.
 */
export const consoleLogger: Logger = {
	debug: (...args) => (import.meta.env.PROD ? undefined : console.debug(...args)),
	debugWarn: (...args) => (import.meta.env.PROD ? undefined : console.warn(...args)),
	info: (...args) => (import.meta.env.MODE === 'test' ? undefined : console.info(...args)),
	warn: (...args) => console.warn(...args),
	error: (...args) => console.error(...args),
};

let defaultLogger: Logger = consoleLogger;

/**
 * Set the default logger for the application.
 */
export function setDefaultLogger(logger: Logger) {
	defaultLogger = logger;
}

/**
 * Dynamic logger wrapper that always delegates to the current default logger.
 * This ensures that early references to getDefaultLogger() continue to work
 * even after setDefaultLogger() is called.
 */
const dynamicLogger: Logger = {
	debug: (...args) => defaultLogger.debug(...args),
	debugWarn: (...args) => defaultLogger.debugWarn(...args),
	info: (...args) => defaultLogger.info(...args),
	warn: (...args) => defaultLogger.warn(...args),
	error: (...args) => defaultLogger.error(...args),
};

/**
 * Get the default logger for the application.
 * Returns a dynamic wrapper that always delegates to the current logger.
 */
export function getDefaultLogger(): Logger {
	return dynamicLogger;
}
