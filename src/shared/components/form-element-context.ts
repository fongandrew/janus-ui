import { createContext, type JSX, useContext } from 'solid-js';

import { type FormElementControl } from '~/shared/components/form-element-control';
import { createPropModContext, mergePropMods } from '~/shared/utility/solid/prop-mod-context';

export const FormElementContext = createContext<FormElementControl | undefined>();

export function useFormElement() {
	return useContext(FormElementContext) as FormElementControl | undefined;
}

export const FormElementPropsContext = createPropModContext();

export function useFormElementProps<T = JSX.HTMLAttributes<HTMLElement>>(props: T): T {
	return mergePropMods(FormElementPropsContext as any, props);
}
