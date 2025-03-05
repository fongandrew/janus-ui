import { type Accessor, createContext, type JSX } from 'solid-js';

import { createAutoId } from '~/shared/utility/solid/auto-prop';

/**
 * Context for sharing reference to a form instance (or rather, its ID)
 */
export const FormContext = createContext<Accessor<string | undefined> | undefined>();

/**
 * Wraps children in a FormContext. Use to bind together a form instance to, e.g., a detached
 * Submit button. Using this forces us to move any ID assignment up higher.
 */
export function FormContextProvider(props: { id?: string | undefined; children: JSX.Element }) {
	const id = createAutoId(props);
	return <FormContext.Provider value={id}>{props.children}</FormContext.Provider>;
}
