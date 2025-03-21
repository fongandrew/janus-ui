import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { FormElementResetProvider } from '~/shared/components/form-element-context';
import { mergeFormElementProps } from '~/shared/components/form-element-props';
import {
	RadioGroupContext,
	type RadioGroupContextValue,
} from '~/shared/components/radio-group-context';
import { createAuto } from '~/shared/utility/solid/auto-prop';
import { extendHandler } from '~/shared/utility/solid/combine-event-handlers';

export interface RadioGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
	/** Shared name to use across radio elements */
	name?: string;
	/** Value of selected radio button */
	value?: string;
	/** Change handler with value set */
	onValue?: (value: string, event: Event) => void;
	/** Children (should have radio elements) */
	children: JSX.Element;
}

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
