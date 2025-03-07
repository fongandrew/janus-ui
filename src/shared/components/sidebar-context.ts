import { type Accessor, createContext } from 'solid-js';

/** Context with ID of sidebar */
export const SidebarContext = createContext<Accessor<string>>();
