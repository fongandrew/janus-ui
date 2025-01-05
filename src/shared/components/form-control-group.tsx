import { type JSX } from 'solid-js';

import {
	createFormControlContext,
	FormControlContext,
} from '~/shared/components/form-control-context';
import { FORM_CONTROL_REF } from '~/shared/components/merge-form-control-props';
import { RefProvider } from '~/shared/components/ref-provider';

/**
 * An FormControl is a way of grouping a label, an input element, and maybe a description
 * and error message.
 */
export function FormControlGroup(props: { children: JSX.Element }) {
	const inputGroupContext = createFormControlContext();
	return (
		<FormControlContext.Provider value={inputGroupContext}>
			<RefProvider refs={{ [FORM_CONTROL_REF]: inputGroupContext.setInput }}>
				{props.children}
			</RefProvider>
		</FormControlContext.Provider>
	);
}
