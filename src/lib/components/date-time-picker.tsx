import { type FormElementProps } from '~/lib/components/form-element-props';
import { BaseInput } from '~/lib/components/input';

export interface DateTimePickerProps extends Omit<FormElementProps<'input'>, 'type'> {}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default date picker
 */
export function DatePicker(props: DateTimePickerProps) {
	return <BaseInput {...props} type="date" />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default time picker
 */
export function TimePicker(props: DateTimePickerProps) {
	return <BaseInput {...props} type="time" />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default datetime picker
 */
export function DateTimePicker(props: DateTimePickerProps) {
	return <BaseInput {...props} type="datetime-local" />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default month picker
 */
export function MonthPicker(props: DateTimePickerProps) {
	return <BaseInput {...props} type="month" />;
}

/**
 * Just a wrapper around existing input but it's a separate component in case we want to
 * do something beyond the default week picker
 */
export function WeekPicker(props: DateTimePickerProps) {
	return <BaseInput {...props} type="week" />;
}
