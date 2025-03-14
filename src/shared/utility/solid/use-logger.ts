import { createContext, useContext } from 'solid-js';

import { getDefaultLogger, type Logger } from '~/shared/utility/logger';

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
