import { type Accessor, createContext, type Setter } from 'solid-js';

/** Signal getter and setter for input ref */
export type FormControlContextValue = [
	Accessor<HTMLElement | null> & { isDefault?: true | undefined },
	Setter<HTMLElement | null>,
];

function defaultAccessor() {
	return null;
}
defaultAccessor.isDefault = true as const;

export const FormControlContext = createContext<FormControlContextValue>([
	defaultAccessor,
	() => {},
]);
