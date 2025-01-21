import { type JSX, useContext } from 'solid-js';

import { FormElementContext } from '~/shared/components/form-element-context';
import { FormElementControl } from '~/shared/components/form-element-control';

export interface FormElementProviderProps {
	children?: JSX.Element | undefined;
}

export function FormElementProvider(props: FormElementProviderProps) {
	const value = useContext(FormElementContext) ?? new FormElementControl();
	return (
		<FormElementContext.Provider value={value}>{props.children}</FormElementContext.Provider>
	);
}
