import { type Accessor, createContext, type Setter, useContext } from 'solid-js';

/** Sidebar open / close / null for default state */
export const SidebarContext = createContext<[Accessor<boolean | null>, Setter<boolean | null>]>();

/** Use sidebar context or error */
export function useSidebar() {
	const ctx = useContext(SidebarContext);
	if (!ctx) throw new Error('useSidebar must be used within a SidebarLayout');
	return ctx;
}
