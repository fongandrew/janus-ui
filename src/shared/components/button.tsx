import '~/shared/components/button.css';

import cx from 'classix';
import { splitProps } from 'solid-js';

import {
	type FormElementProps,
	mergeFormElementProps,
} from '~/shared/components/form-element-props';

export interface ButtonProps extends FormElementProps<'button'> {
	/** Removes default styling */
	unstyled?: boolean | undefined;
	/**
	 * By default, buttons are treated as an input element within a label group,
	 * but we can unset this (e.g. if there are multiple buttons or buttons alongside
	 * inputs, etc.)
	 */
	unsetFormInput?: boolean | undefined;
}

export function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formElementProps = mergeFormElementProps<'button'>(rest);
	return (
		<button
			type="button"
			{...formElementProps}
			class={cx('c-button--unstyled', !local.unstyled && 'c-button', props.class)}
		/>
	);
}

export function IconButton(props: ButtonProps & { label: string }) {
	const [local, rest] = splitProps(props, ['label']);
	return (
		<Button
			aria-label={local.label}
			{...rest}
			class={cx('c-button--icon', props.class)}
			unstyled
		/>
	);
}
