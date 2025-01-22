import { createContext } from 'solid-js';

/**
 * Context for sharing info about a form. Used to reference a form while not
 * actually being inside it.
 */
export interface FormContextShape {
	/** Signal accessor for form ID */
	id: () => string | undefined;
	/** Set form ID */
	setId: (id: string | undefined) => void;
}

/**
 * Context for sharing reference to a form instance (or rather, its ID)
 */
export const FormContext = createContext<FormContextShape>({
	id: () => undefined,
	setId: () => {},
});
