import { type JSX } from 'solid-js';

import { createFormContext, FormContext } from '~/shared/components/form-context';

/**
 * Wraps children in a FormContext. Use to bind together a form instance to, e.g., a detached
 * Submit button.
 */
export function FormContextProvider(props: { children: JSX.Element }) {
	return (
		<FormContext.Provider value={createFormContext()}>{props.children}</FormContext.Provider>
	);
}
