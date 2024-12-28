import { createContext } from 'solid-js';

export interface ModalContextValue {
	/** Signal for open state of modal */
	open?: () => boolean;
	/** Signal for a form element (so we can stick submit in */
	form?: () => HTMLFormElement | null;
	/** Setter for form */
	setForm?: (form: HTMLFormElement) => void;
}

export const ModalContext = createContext<ModalContextValue | undefined>(undefined);
