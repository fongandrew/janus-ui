import { createContext, useContext } from 'solid-js';

import { type FormElementControl } from '~/shared/components/form-element-control';

export const FormElementContext = createContext<FormElementControl | undefined>();

export function useFormElement() {
	return useContext(FormElementContext) as FormElementControl | undefined;
}
