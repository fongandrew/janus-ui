import { type Accessor, createContext } from 'solid-js';

export const ModalContext = createContext<Accessor<string> | undefined>();
