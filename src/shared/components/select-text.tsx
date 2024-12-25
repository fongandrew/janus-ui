import { createMemo } from 'solid-js';

import { createMountedSignal } from '~/shared/utility/solid/create-mounted-signal';

export interface SelectTextProps {
	/** Callback to get current HTML element for value */
	getItemByValue: (value: string) => HTMLElement | null;
	/** Placeholder text, if any */
	placeholder?: string | undefined;
	/** Currently selected values */
	values: Set<string>;
}

/**
 * Display the current selection for a select component.
 */
export function SelectText(props: SelectTextProps) {
	// Generate content of trigger
	const isMounted = createMountedSignal();
	const selectionText = createMemo(() => {
		if (!isMounted()) return;

		const valuesSet = props.values;
		if (valuesSet?.size === 1) {
			for (const value of valuesSet) {
				const textContent = props.getItemByValue(value)?.textContent;
				if (textContent) {
					return <>{textContent}</>;
				}
			}
		}

		if (valuesSet && (valuesSet.size ?? 0) > 1) {
			return <span>{valuesSet.size} selected</span>;
		}

		return <span class="c-select__placeholder">{props.placeholder}</span>;
	});

	return <>{selectionText()}</>;
}
