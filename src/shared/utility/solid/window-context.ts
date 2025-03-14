import { createContext, useContext } from 'solid-js';

import { parentWindow } from '~/shared/utility/multi-view';

export const WindowContext = createContext(parentWindow);

export function useWindow() {
	return useContext(WindowContext);
}
