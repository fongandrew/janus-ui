import { type Accessor, createContext, createSignal, type Setter, useContext } from 'solid-js';

import { PropBuilder } from '~/shared/utility/solid/prop-builder';

export interface SidebarContextShape {
	/** Signal for open / close state  */
	open: [Accessor<boolean | null>, Setter<boolean | null>];
	/** PropBuilder instance that lets sidebar component assign attributes to toggle button */
	toggleCtrl: PropBuilder<'button'>;
}

/** Manage relationship between sidebar and its parts (and toggle buttons outside) */
export const SidebarContext = createContext<SidebarContextShape>();

/** Use sidebar context or error */
export function useSidebar() {
	const ctx = useContext(SidebarContext);
	if (!ctx) throw new Error('useSidebar must be used within a SidebarLayout');
	return ctx;
}

/** Create sidebar context */
export function createSidebarContext(): SidebarContextShape {
	// Passing signal as value, not using directly within component
	// eslint-disable-next-line solid/reactivity
	const open = createSignal<boolean | null>(null);
	const toggleCtrl = new PropBuilder<'button'>();
	return { open, toggleCtrl };
}
