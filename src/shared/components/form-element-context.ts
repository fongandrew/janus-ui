import { createContext, type JSX, useContext } from 'solid-js';

import { type FormElementControl } from '~/shared/components/form-element-control';
import {
	createPropModContext,
	mergePropMods,
	type PropModGeneric,
} from '~/shared/utility/solid/prop-mod-context';

export const FormElementContext = createContext<FormElementControl | undefined>();

export function useFormElement() {
	return useContext(FormElementContext) as FormElementControl | undefined;
}

export const FormElementPropsContext = createPropModContext();

// The form element props system is a little loosey-goosey with types since form elements
// can be anything from a button to inputs to  a div with ARIA props. It's all the same
// at runtime, but create some extra typed variants to make working with it easier.
export const FormElementPropsProvider = FormElementPropsContext.Provider;
export const FormElementButtonPropsProvider = FormElementPropsContext.Provider as (
	props: PropModGeneric<JSX.ButtonHTMLAttributes<HTMLButtonElement>> & { children: JSX.Element },
) => JSX.Element;
export const FormElementInputPropsProvider = FormElementPropsContext.Provider as (
	props: PropModGeneric<JSX.InputHTMLAttributes<HTMLInputElement>> & { children: JSX.Element },
) => JSX.Element;

// Reset to prevent form element props from being passed down to some subset of children
export const FormElementResetProvider = FormElementPropsContext.Reset;

export function useFormElementProps<T = JSX.HTMLAttributes<HTMLElement>>(props: T): T {
	return mergePropMods(FormElementPropsContext as any, props);
}
