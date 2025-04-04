import cx from 'classix';
import { createUniqueId, type JSX, mergeProps, splitProps } from 'solid-js';

import { sliderChangeSync, sliderInputSync } from '~/shared/components/callbacks/slider';
import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { attrs } from '~/shared/utility/attribute-list';
import { callbackAttrs } from '~/shared/utility/callback-attrs/callback-registry';
import { parseIntOrNull } from '~/shared/utility/parse';
import { step } from '~/shared/utility/step';

export interface SliderProps extends Omit<FormElementProps<'input'>, 'type'> {
	/** Specify a unit like `%` or `px` that gets appended in input area */
	unit?: JSX.Element | undefined;
	/** Force min into numeric form */
	min?: number | undefined;
	/** Force max into numeric form */
	max?: number | undefined;
	/** Force steps into numeric form */
	step?: number | undefined;
	/** Numeric value instead of strings */
	value?: number | undefined;
	/** Callback that parses value */
	onValue?: (value: number | null) => void;
}

/**
 * Combination range + number input for typing. The number input is the actual thing that
 * gets focused for screenreader users. The range input is there for visual users.
 */
export function Slider(props: SliderProps) {
	const [local, shared, rest] = splitProps(
		props,
		['class', 'classList', 'onValue', 'unit'],
		['onInput'],
	);
	const withDefaults = mergeProps(rest, shared, {
		class: 'c-slider__number t-unstyled',
		min: 0,
		max: 100,
		step: 1,
	});
	const formControlProps = mergeFormElementProps<'input'>(withDefaults);

	const defaultValue = () =>
		step(
			withDefaults.min,
			withDefaults.max,
			withDefaults.step,
			(withDefaults.min + withDefaults.max) / 2,
		);

	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		local.onValue?.(parseIntOrNull(target.value));
	};

	const unitId = createUniqueId();

	return (
		<div
			classList={local.classList}
			class={cx('c-slider', local.class)}
			onInput={handleInput}
			{...callbackAttrs(sliderInputSync, sliderChangeSync)}
		>
			<input
				// Not focusable because we want to emphasize number input
				tabIndex={-1}
				type="range"
				class="c-slider__range"
				disabled={String(formControlProps['aria-disabled']) === 'true'}
				min={withDefaults.min}
				max={withDefaults.max}
				step={withDefaults.step}
				value={props.value ?? defaultValue()}
				{...shared}
			/>
			<div class="c-slider__input">
				<input
					{...formControlProps}
					aria-describedby={attrs(
						formControlProps['aria-describedby'],
						!!local.unit && unitId,
					)}
					type="number"
					size={3}
					value={props.value ?? defaultValue()}
				/>
				{local.unit && (
					<div id={unitId} class="c-slider__unit">
						{local.unit}
					</div>
				)}
			</div>
		</div>
	);
}
