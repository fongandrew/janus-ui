import { type JSX } from 'solid-js';

import {
	createFormControlContext,
	FormControlContext,
} from '~/shared/components/form-control-context';
import { FormControlRef } from '~/shared/components/form-control-ref';

/**
 * An FormControl is a way of grouping a label, an input element, and maybe a description
 * and error message.
 */
export function FormControlGroup(props: { children: JSX.Element }) {
	const inputGroupContext = createFormControlContext();
	return (
		<FormControlContext.Provider value={inputGroupContext}>
			<FormControlRef ref={inputGroupContext.setInput}>{props.children}</FormControlRef>
		</FormControlContext.Provider>
	);
}
