import cx from 'classix';
import { type JSX, splitProps } from 'solid-js';

import { useFormControl } from '~/shared/components/use-form-control';

export interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
	/** Removes default styling */
	unstyled?: boolean | undefined;
}

export function Button(props: ButtonProps) {
	const [local, rest] = splitProps(props, ['unstyled']);
	const formControlProps = useFormControl(rest);
	return (
		<button
			{...formControlProps}
			class={cx('c-button--unstyled', !local.unstyled && 'c-button', props.class)}
		/>
	);
}
