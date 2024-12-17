import { createContext, type JSX } from 'solid-js';

export interface RadioGroupContextValue {
	name: () => string;
	value: () => string | undefined;
	onChange: JSX.ChangeEventHandler<HTMLInputElement, Event>;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | undefined>();
