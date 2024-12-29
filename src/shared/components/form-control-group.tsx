import { type JSX } from 'solid-js';

import {
	createFormControlContext,
	FormControlContext,
} from '~/shared/components/form-control-context';

/**
 * An FormControl is a way of grouping a label, an input element, and maybe a description
 * and error message.
 */
export function FormControlGroup(props: { children: JSX.Element }) {
	const inputGroupContext = createFormControlContext();
	return (
		<FormControlContext.Provider value={inputGroupContext}>
			{props.children}
		</FormControlContext.Provider>
	);
}
