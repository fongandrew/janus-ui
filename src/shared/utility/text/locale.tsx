import { createContext, useContext } from 'solid-js';

/** Context for the current locale */
export const LocaleContext = createContext<string | undefined>(undefined);

let defaultLocale = 'en-US';

/**
 * Set the default logger for the application.
 */
export function setDefaultLocale(locale: string) {
	defaultLocale = locale;
}

/**
 * Get the default locale for the application.
 */
export function getDefaultLocale() {
	return defaultLocale;
}

export function useLocale() {
	return useContext(LocaleContext) ?? getDefaultLocale();
}
