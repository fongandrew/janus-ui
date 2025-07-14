import { type Accessor, type ComponentProps, createContext, type JSX } from 'solid-js';

import { createAutoId } from '~/lib/utility/solid/auto-prop';

/**
 * Context for sharing props to pass down to a form
 */
export const FormContext = createContext<
	| {
			id: Accessor<string | undefined>;
			action: Accessor<ComponentProps<'form'>['action'] | undefined>;
	  }
	| undefined
>();

/**
 * Wraps children in a FormContext. Use to bind together a form instance to, e.g., a detached
 * Submit button. Using this forces us to move any ID assignment up higher.
 */
export function FormContextProvider(props: {
	id?: string | undefined;
	action?: string | undefined;
	children: JSX.Element;
}) {
	const id = createAutoId(props);
	return (
		<FormContext.Provider
			value={{
				id,
				action: () => props.action,
			}}
		>
			{props.children}
		</FormContext.Provider>
	);
}
