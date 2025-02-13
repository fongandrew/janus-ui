import { type Accessor, createContext, createSignal, type Setter, useContext } from 'solid-js';

/** TopNav drawer open / close / null for default state */
export const TopNavContext = createContext<{
	/** Whether drawer is open */
	open: [Accessor<boolean | null>, Setter<boolean | null>];
	/** Whether bar has been hidden via scrolling */
	hidden: [Accessor<boolean | null>, Setter<boolean | null>];
}>();

/** Use topnav context or error */
export function useTopNav() {
	const ctx = useContext(TopNavContext);
	if (!ctx) throw new Error('useTopNav must be used within a TopNavLayout');
	return ctx;
}

/** Create top nav shape */
export function createTopNavContext() {
	// No need to destructure since we're just stashing the signals directly in context
	// eslint-disable-next-line solid/reactivity
	const open = createSignal<boolean | null>(null);
	// eslint-disable-next-line solid/reactivity
	const hidden = createSignal<boolean | null>(null);
	return { open, hidden };
}
