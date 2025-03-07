import { type Accessor, createMemo, createUniqueId, type JSX } from 'solid-js';

import { type FormElementProps } from '~/shared/components/form-element-props';
import {
	createPropModContext,
	mergePropMods,
	type PropModGeneric,
	useSingleProp,
} from '~/shared/utility/solid/prop-mod-context';

export const FormElementPropsContext = createPropModContext<FormElementProps<'div'>>();

// The form element props system is a little loosey-goosey with types since form elements
// can be anything from a button to inputs to  a div with ARIA props. It's all the same
// at runtime, but create some extra typed variants to make working with it easier.
export const FormElementPropsProvider = FormElementPropsContext.Provider;
export const FormElementButtonPropsProvider = FormElementPropsContext.Provider as (
	props: PropModGeneric<FormElementProps<'button'>> & { children: JSX.Element },
) => JSX.Element;
export const FormElementInputPropsProvider = FormElementPropsContext.Provider as (
	props: PropModGeneric<FormElementProps<'input'>> & { children: JSX.Element },
) => JSX.Element;

/**
 * Reset to prevent form element props from being passed down to some subset of children
 */
export const FormElementResetProvider = FormElementPropsContext.Reset;

/**
 * Merge any prop mods from parent context with given props
 */
export function useFormElementProps<T = JSX.HTMLAttributes<HTMLElement>>(props: T): T {
	return mergePropMods(FormElementPropsContext as any, props);
}

/**
 * For special case where we need to assign a default ID to a form element and want
 * to check if a parent element has already assigned it.
 */
export function createFormElementId(props: { id?: string | undefined }): Accessor<string>;
export function createFormElementId<TKey extends string = 'id'>(
	props: Partial<Record<TKey, string | undefined>>,
	key: TKey,
): Accessor<string>;
export function createFormElementId<TKey extends string = 'id'>(
	props: Partial<Record<TKey, string | undefined>>,
	key: TKey = 'id' as TKey,
) {
	const memo = createMemo(() => {
		const prev = useSingleProp(FormElementPropsContext, 'id');
		if (prev && props[key] && prev !== props[key]) {
			throw new Error(`Conflicting IDs: ${prev} and ${props[key]}`);
		}
		return prev ?? props[key] ?? createUniqueId();
	});
	return memo;
}
