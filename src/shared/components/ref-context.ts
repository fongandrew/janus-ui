import { createContext } from 'solid-js';

/**
 * Ref context type is a function that takes a reference to a type of ref and returns
 * all the ref callbacks for that type.
 */
export type RefContextValue = (refType: string | symbol) => ((elm: HTMLElement | null) => void)[];

export const RefContext = createContext<RefContextValue>(() => []);
