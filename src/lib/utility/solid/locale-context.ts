import { createContext, useContext } from 'solid-js';

import { parentDocument } from '~/lib/utility/multi-view';
import { DEFAULT_LOCALE } from '~/lib/utility/text/default-locale';
import { getT } from '~/lib/utility/text/t-tag';

export const LocaleContext = createContext(parentDocument?.documentElement.lang);

export function useLocale() {
	return useContext(LocaleContext) || DEFAULT_LOCALE;
}

export function useT() {
	return getT(useLocale());
}
