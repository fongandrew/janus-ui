export interface SelectTextProps {
	/** ID of the span for the update text */
	id: string;
	/** Placeholder text, if any */
	placeholder?: string | undefined;
}

/**
 * Display the current selection for a select component.
 */
export function SelectText(props: SelectTextProps) {
	return (
		<>
			<span id={props.id} />
			<span class="c-select__placeholder">{props.placeholder}</span>
		</>
	);
}
