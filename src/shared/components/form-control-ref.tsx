import { type JSX, useContext } from 'solid-js';

import { FormControlRefContext } from '~/shared/components/form-control-ref-context';

export interface FormControlRefProps {
	/** Callback that receives the ref of the form control element. */
	ref: (elm: HTMLElement | null) => void;
	/** Additional provider children */
	children?: JSX.Element;
}

/**
 * Adds an additional ref callback to the nested form control element.
 */
export function FormControlRef(props: FormControlRefProps) {
	const context = useContext(FormControlRefContext);
	return (
		<FormControlRefContext.Provider value={{ cbs: () => [...context.cbs(), props.ref] }}>
			{props.children}
		</FormControlRefContext.Provider>
	);
}
