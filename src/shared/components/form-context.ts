import { type Accessor, createContext, createSignal, type Setter } from 'solid-js';

/**
 * Context for sharing info about a form. Used to reference a form while not
 * actually being inside it.
 */
export interface FormContextShape {
	/** Signal for form ID */
	idSig: [Accessor<string | undefined>, Setter<string | undefined>];
	/** Signal for whether form is busy (submitting) */
	submittingSig: [Accessor<boolean>, Setter<boolean>];
}

/**
 * Context for sharing reference to a form instance (or rather, its ID)
 */
export const FormContext = createContext<FormContextShape | undefined>();

/**
 * Create a new form context
 */
export function createFormContext(): FormContextShape {
	const [id, setId] = createSignal<string | undefined>(undefined);
	const [submitting, setSubmitting] = createSignal(false);
	return {
		idSig: [id, setId],
		submittingSig: [submitting, setSubmitting],
	};
}
