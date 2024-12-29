import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { mergeFormControlProps } from '~/shared/components/merge-form-control-props';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Force callback ref */
	ref?: (el: HTMLButtonElement) => void;
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
	const formControlProps = mergeFormControlProps(rest);
	return (
		<button
			{...formControlProps}
			class={cx('c-button--unstyled', !local.unstyled && 'c-button', props.class)}
		/>
	);
}
