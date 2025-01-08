import {
	type Accessor,
	createContext,
	createEffect,
	createSignal,
	type JSX,
	onCleanup,
	type Setter,
	useContext,
} from 'solid-js';

import { FormContext } from '~/shared/components/form-context';

export interface FormControlContextValue {
	/** Signal getter for input ref */
	input: Accessor<HTMLElement | undefined>;
	/** Signal setter for input ref */
	setInput: Setter<HTMLElement | undefined>;
	/** Signal getter for error content */
	error: Accessor<(() => JSX.Element) | null>;
	/** Signal setter for error content */
	setError: Setter<(() => JSX.Element) | null>;
}

export const FormControlContext = createContext<FormControlContextValue | undefined>(undefined);

export function createFormControlContext(): FormControlContextValue {
	const [input, setInput] = createSignal<HTMLElement>();

	// Two error signals -- one for errors set locally by input itself and one by
	// form-wide validation process
	const [localError, setLocalError] = createSignal<(() => JSX.Element) | null>(null);
	const [formError, setFormError] = createSignal<(() => JSX.Element) | null>(null);
	const error = () => localError() || formError();

	const formContext = useContext(FormContext);
	createEffect(() => {
		if (!formContext) return;

		const inputElm = input();
		if (!inputElm) return;

		formContext.addElement(inputElm, [error, setFormError]);
		onCleanup(() => formContext.removeElement(inputElm));
	});

	return { input, setInput, error, setError: setLocalError };
}
