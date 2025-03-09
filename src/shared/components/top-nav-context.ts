import { type Accessor, createContext } from 'solid-js';

/** TopNav drawer open / close / null for default state */
export const TopNavContext = createContext<Accessor<string>>();
