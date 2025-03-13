import { createContext } from 'solid-js';

export interface RadioGroupContextValue {
	name: () => string;
	value: () => string | undefined;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | undefined>();
