import { createContext, useContext } from 'solid-js';

import { isDev } from '~/shared/utility/is-dev';

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
	...console,
	debug: isDev() ? console.debug : () => {},
	debugWarn: isDev() ? console.warn : () => {},
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

/**
 * Solid context to override logger
 */
export const LoggerContext = createContext<Logger | undefined>(undefined);

/**
 * Get the logger for  the application
 */
export function useLogger(): Logger {
	const logger = useContext(LoggerContext) ?? getDefaultLogger();
	return logger;
}
