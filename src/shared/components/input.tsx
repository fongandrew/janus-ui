import cx from 'classix';
import { splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';

export interface InputProps extends Omit<FormElementProps<'input'>, 'type'> {
	/** Input type -- intentionally excluding some inputs for which there's a better component */
	type?:
		| 'color'
		| 'date'
		| 'datetime-local'
		| 'email'
		| 'file'
		| 'month'
		| 'number'
		| 'password'
		| 'range'
		| 'search'
		| 'tel'
		| 'text'
		| 'time'
		| 'url'
		| 'week'
		| undefined;
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

/** General text input */
export function Input(props: InputProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formControlProps = mergeFormElementProps<'input'>(rest);
	return <input {...formControlProps} class={cx(!local.unstyled && 'c-input', props.class)} />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default date picker
 */
export function InputDate(props: InputProps) {
	return <Input {...props} type="date" />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default time picker
 */
export function InputTime(props: InputProps) {
	return <Input {...props} type="time" />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default datetime picker
 */
export function InputDateTime(props: InputProps) {
	return <Input {...props} type="datetime-local" />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default month picker
 */
export function InputMonth(props: InputProps) {
	return <Input {...props} type="month" />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default week picker
 */
export function InputWeek(props: InputProps) {
	return <Input {...props} type="week" />;
}
