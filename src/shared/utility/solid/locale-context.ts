import { createContext, useContext } from 'solid-js';

import { parentDocument } from '~/shared/utility/multi-view';
import { DEFAULT_LOCALE } from '~/shared/utility/text/default-locale';
import { getT } from '~/shared/utility/text/t-tag';

export const LocaleContext = createContext(parentDocument?.documentElement.lang);

export function useLocale() {
	return useContext(LocaleContext) || DEFAULT_LOCALE;
}

export function useT() {
	return getT(useLocale());
}
