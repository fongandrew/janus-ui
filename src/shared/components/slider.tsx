import '~/shared/components/slider.css';

import cx from 'classix';
import { createSignal, type JSX, mergeProps, splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';
import { handleEvent } from '~/shared/utility/solid/handle-event';
import { step } from '~/shared/utility/step';

export interface SliderProps extends Omit<FormElementProps<'input'>, 'type'> {
	/** Specify a unit like `%` or `px` that gets appended in input area */
	unit?: JSX.Element | undefined;
	/** Default value */
	defaultValue?: number | undefined;
	/** Force min into numeric form */
	min?: number | undefined;
	/** Force max into numeric form */
	max?: number | undefined;
	/** Force steps into numeric form */
	step?: number | undefined;
	/** Numeric value instead of strings */
	value?: number | undefined;
}

function parseValue(value: string | undefined, defaultValue = 0) {
	if (value === undefined) {
		return defaultValue;
	}

	const parsed = parseInt(value);
	return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Combination range + number input for typing. The number input is the actual thing that
 * gets focused for screenreader users. The range input is there for visual users.
 */
export function Slider(props: SliderProps) {
	const [local, rest] = splitProps(props, ['class', 'classList', 'defaultValue', 'unit']);
	const withDefaults = mergeProps(rest, {
		min: 0,
		max: 100,
		step: 1,
	});
	const formControlProps = mergeFormElementProps<'input'>(withDefaults);
	const [uncontrolledValue, setUncontrolledValue] = createSignal(local.defaultValue);
	const value = () =>
		props.value ??
		uncontrolledValue() ??
		step(
			withDefaults.min,
			withDefaults.max,
			withDefaults.step,
			(withDefaults.min + withDefaults.max) / 2,
		);
	const handleInput = (e: Event) => {
		const target = e.target as HTMLInputElement;
		setUncontrolledValue(parseValue(target.value));
		handleEvent(target, props.onInput, e);
	};

	return (
		<div classList={local.classList} class={cx('c-slider', local.class)}>
			<input
				// Not focusable because we want to emphasize number input
				tabIndex={-1}
				type="range"
				class="c-slider__range"
				min={withDefaults.min}
				max={withDefaults.max}
				step={withDefaults.step}
				value={value()}
				onInput={handleInput}
			/>
			<div class="c-slider__input">
				<input
					{...formControlProps}
					type="number"
					class="c-slider__number t-unstyled"
					value={value()}
					onInput={handleInput}
					size={3}
				/>
				{local.unit && <div class="c-slider__unit">{local.unit}</div>}
			</div>
		</div>
	);
}
