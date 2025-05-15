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

let defaultLogger: Logger = {
	// Wrap everything so tests can still mock console.<method>
	debug: (...args) => (import.meta.env.PROD ? undefined : console.debug(...args)),
	debugWarn: (...args) => (import.meta.env.PROD ? undefined : console.warn(...args)),
	info: (...args) => (import.meta.env.MODE === 'test' ? undefined : console.info(...args)),
	warn: (...args) => console.warn(...args),
	error: (...args) => console.error(...args),
};

/**
 * Set the default logger for the application.
 */
export function setDefaultLogger(logger: Logger) {
	defaultLogger = logger;
}

/**
 * Get the default logger for the application.
 */
export function getDefaultLogger(): Logger {
	return defaultLogger;
}
