import { type JSX, useContext } from 'solid-js';

import { RefContext, type RefContextValue } from '~/shared/components/ref-context';

export interface FormControlRefProps {
	/** Map from type to callback that receives the ref of the form control element. */
	refs: Record<string | symbol, (elm: HTMLElement | null) => void>;
	/** Additional provider children */
	children?: JSX.Element;
}

/**
 * Adds an additional ref callback to the nested form control element.
 */
export function RefProvider(props: FormControlRefProps) {
	const getPrevRefs = useContext(RefContext);

	const getNextRefs: RefContextValue = (refType) => {
		const prevRefs = getPrevRefs(refType);
		return props.refs[refType] ? [...prevRefs, props.refs[refType]] : prevRefs;
	};

	return <RefContext.Provider value={getNextRefs}>{props.children}</RefContext.Provider>;
}
