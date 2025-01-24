import { createContext } from 'solid-js';

export interface ModalContextValue {
	/** Signal for open state of modal */
	open: () => boolean;
}

export const ModalContext = createContext<ModalContextValue | undefined>(undefined);
