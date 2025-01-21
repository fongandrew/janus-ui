import { type JSX, useContext } from 'solid-js';

import { FormElementContext } from '~/shared/components/form-element-context';
import { FormElementControl } from '~/shared/components/form-element-control';
import { unreactivePropAccess } from '~/shared/utility/solid/unreactive-prop-access';

export interface FormElementProviderProps {
	/** Callback to modify / declare stuff on the FormElementControl */
	ctrlRef?: (control: FormElementControl) => void;
	/** Children that maybe contains this form element */
	children?: JSX.Element | undefined;
}

export function FormElementProvider(props: FormElementProviderProps) {
	const value = useContext(FormElementContext) ?? new FormElementControl();
	const [ctrlRef] = unreactivePropAccess(props, ['ctrlRef']);
	ctrlRef?.(value);
	return (
		<FormElementContext.Provider value={value}>{props.children}</FormElementContext.Provider>
	);
}
