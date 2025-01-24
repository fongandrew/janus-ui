import { createContext } from 'solid-js';

export interface ModalContextValue {
	/** Accessor for ID for modal */
	id: () => string;
	/** Signal for open state of modal */
	open: () => boolean;
	/** Callback to register onRequestClose handler */
	onRequestClose: (handler: () => boolean | void) => void;
}

export const ModalContext = createContext<ModalContextValue | undefined>(undefined);
