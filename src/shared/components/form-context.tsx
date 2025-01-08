import { type Accessor, createContext, type JSX, type Setter } from 'solid-js';

/** Represents an element being passed for validation */
export interface FormDataElement<TName> extends HTMLElement {
	name: TName;
	value: string;
	files?: FileList;
}

/** Form context for communication between form and individual elements */
export interface FormContextValue {
	/**
	 * Registers a new element for this form with a signal tuple for fine-grained
	 * error setting / clearing
	 */
	addElement: (
		element: HTMLElement,
		errorSignal: [Accessor<(() => JSX.Element) | null>, Setter<(() => JSX.Element) | null>],
	) => void;
	/** Removes an element for this form */
	removeElement: (element: HTMLElement) => void;
	/** Clears all errors */
	clearErrors: () => void;
	/** Checks if there are any errors */
	hasErrors: () => boolean;
	/** Sets new error for an element, returns true if successful */
	setError: (element: HTMLElement, error: () => JSX.Element) => boolean;
}

export const FormContext = createContext<FormContextValue | undefined>(undefined);

export function createFormContext(): FormContextValue {
	const elements = new Map<
		HTMLElement,
		[Accessor<(() => JSX.Element) | null>, Setter<(() => JSX.Element) | null>]
	>();

	return {
		addElement(element, errorSignal) {
			elements.set(element, errorSignal);
		},
		removeElement(element) {
			elements.delete(element);
		},
		clearErrors() {
			for (const [, [, setError]] of elements) {
				setError(null);
			}
		},
		hasErrors() {
			for (const [error] of elements.values()) {
				if (error()) return true;
			}
			return false;
		},
		setError(element, error) {
			const signalTuple = elements.get(element);
			if (!signalTuple) return false;

			/**
			 * Must use functional form when setting error because
			 * store signal value is itself a function
			 */
			signalTuple[1](() => error);
			return true;
		},
	};
}
