import { createSignal, type JSX } from 'solid-js';

import { FormContext } from '~/shared/components/form-context';

/**
 * Wraps children in a FormContext. Use to bind together a form instance to, e.g., a detached
 * Submit button.
 */
export function FormContextProvider(props: { children: JSX.Element }) {
	const [id, setId] = createSignal<string | undefined>(undefined);
	return <FormContext.Provider value={{ id, setId }}>{props.children}</FormContext.Provider>;
}
