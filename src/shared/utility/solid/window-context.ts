import { createContext, useContext } from 'solid-js';
import { isServer } from 'solid-js/web';

export const WindowContext = createContext(isServer ? undefined : window);

export function useWindow() {
	return useContext(WindowContext);
}
