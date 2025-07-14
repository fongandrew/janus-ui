/**
 * Context for grabbing references to memoized resources (mostly to clear and reset them)
 * caches. Caches should be added to context when they're *created*, not *used*.
 */
import { createContext, useContext } from 'solid-js';

export interface MemoizedResource {
	clear: () => void;
}

export const ResourceContext = createContext(new Set<MemoizedResource>());

export function useResourceContext() {
	return useContext(ResourceContext);
}

export function clearResources() {
	const context = useResourceContext();
	for (const resource of context) {
		resource.clear();
	}

	// We intentionally don't clear the context itself. Resources may still be
	// usable, and clearing the context would break our ability to clear them in
	// the future. This means we retain a reference to each created resource in
	// the context, which is a potential memory leak. This is by design when the
	// resource caches are created in global / module scope. If caches are being
	// created in a scope that can be cleaned up (e.g. a component tree), create
	// a new context that gets dumped when that scope is disposed of.
}
