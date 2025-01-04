import { createContext } from 'solid-js';

export interface FormControlRefContextValue {
	cbs: () => ((elm: HTMLElement | null) => void)[];
}

export const FormControlRefContext = createContext<FormControlRefContextValue>({
	cbs: () => [],
});
