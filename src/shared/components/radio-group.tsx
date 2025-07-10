import cx from 'classix';
import { type ComponentProps, type JSX, splitProps } from 'solid-js';

import { FormElementResetProvider } from '~/shared/components/form-element-context';
import { mergeFormElementProps } from '~/shared/components/form-element-props';
import {
	RadioGroupContext,
	type RadioGroupContextValue,
} from '~/shared/components/radio-group-context';
import { createAuto } from '~/shared/utility/solid/auto-prop';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';

export interface RadioGroupProps extends ComponentProps<'div'> {
	/** Shared name to use across radio elements */
	name?: string;
	/** Value of selected radio button */
	value?: string;
	/** Change handler with value set */
	onValue?: (value: string, event: Event) => void;
	/** Children (should have radio elements) */
	children: JSX.Element;
}

/**
 * Radio group component for organizing related radio buttons
 *
 * @example
 * ```tsx
 * // Basic usage with state management + label
 * const [value, setValue] = createSignal('option1');
 *
 * 	<LabelledInput label="Select an option" description="Please choose one">
 * 		<RadioGroup name="options" value={value()} onValue={setValue}>
 * 			<Label>
 * 				<Radio value="a" /> Option A
 * 			</Label>
 * 			<Label>
 * 				<Radio value="b" /> Option B
 * 			</Label>
 * 		</RadioGroup>
 * 	</LabelledInput>
 * ```
 */
export function RadioGroup(props: RadioGroupProps) {
	const [local, rest] = splitProps(props, ['name', 'value', 'onValue', 'children']);
	const name = createAuto(local, 'name');

	const handleChange = (event: Event) => {
		const target = event.target;
		if (target instanceof HTMLInputElement) {
			local.onValue?.(target.value, event);
		}
	};

	const radioGroupProps = mergeFormElementProps<'div'>(rest);

	const context: RadioGroupContextValue = {
		name,
		value: () => local.value,
	};

	return (
		<div
			role="radiogroup"
			{...radioGroupProps}
			{...extendHandler(radioGroupProps, 'onChange', handleChange)}
			class={cx('c-radio-group t-label-stack--no-indent', radioGroupProps.class)}
		>
			{/* Reset FormElementProvider because it would potentially apply to multiple inputs */}
			<FormElementResetProvider>
				<RadioGroupContext.Provider value={context}>
					{local.children}
				</RadioGroupContext.Provider>
			</FormElementResetProvider>
		</div>
	);
}
