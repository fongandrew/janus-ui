import { selectUpdateText } from '~/shared/callback-attrs/select';

export interface SelectTextProps {
	/** Placeholder text, if any */
	placeholder?: string | undefined;
}

/**
 * Display the current selection for a select component.
 */
export function SelectText(props: SelectTextProps) {
	return (
		<>
			<span {...{ [selectUpdateText.DESC_ATTR]: '' }} />
			<span class="c-select__placeholder">{props.placeholder}</span>
		</>
	);
}
