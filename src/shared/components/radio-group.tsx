import { createSignal, type JSX } from 'solid-js';

import {
	RadioGroupContext,
	type RadioGroupContextValue,
} from '~/shared/components/radio-group-context';
import { handleEvent } from '~/shared/utility/solid/handle-event';

export interface RadioGroupProps {
	name: string;
	defaultValue?: string;
	value?: string;
	onChange?: JSX.ChangeEventHandlerUnion<HTMLInputElement, Event>;
	children: JSX.Element;
	class?: string;
}

export function RadioGroup(props: RadioGroupProps) {
	const [internalValue, setInternalValue] = createSignal(props.defaultValue);

	const handleChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (event) => {
		const target = event.target as HTMLInputElement;
		setInternalValue(target.value);
		handleEvent(target, props.onChange, event);
	};

	const context: RadioGroupContextValue = {
		name: () => props.name,
		value: () => props.value ?? internalValue(),
		onChange: handleChange,
	};

	return (
		<RadioGroupContext.Provider value={context}>{props.children}</RadioGroupContext.Provider>
	);
}
